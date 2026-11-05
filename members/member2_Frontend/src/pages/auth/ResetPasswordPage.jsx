import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import './AuthForms.css';

const PASSWORD_MIN = 6;
const PASSWORD_MAX = 24;
const TOKEN_REGEX = /^[a-f0-9]{64}$/;

export default function ResetPasswordPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Đọc token một lần từ ?token=... trên URL
    const [token] = useState(() => searchParams.get('token') || '');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    // Xóa token khỏi thanh địa chỉ để không nằm lại trong lịch sử trình duyệt hay bị chụp màn hình.
    useEffect(() => {
        if (searchParams.has('token')) {
            navigate(location.pathname, { replace: true });
        }
        // Chỉ chạy một lần khi mở trang
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (newPassword.length < PASSWORD_MIN || newPassword.length > PASSWORD_MAX) {
            setError(`Mật khẩu mới phải có từ ${PASSWORD_MIN} đến ${PASSWORD_MAX} ký tự.`);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Hai mật khẩu chưa giống nhau. Hãy nhập lại cho khớp.');
            return;
        }

        setLoading(true);
        try {
            await apiClient('/auth/reset-password', {
                method: 'POST',
                body: { token, newPassword },
            });
            // Phiên cũ trên trình duyệt này đã bị server vô hiệu hóa, xóa luôn để không bị
            // chuyển thẳng vào trang chính với token chết.
            logout();
            setDone(true);
        } catch (err) {
            setError(
                err?.message || 'Không đặt lại được mật khẩu. Kiểm tra kết nối mạng rồi thử lại.'
            );
        } finally {
            setLoading(false);
        }
    }

    // Liên kết thiếu token hoặc token sai định dạng (ví dụ email cắt mất một đoạn)
    if (!TOKEN_REGEX.test(token) && !done) {
        return (
            <main className="af-page">
                <section className="af-card">
                    <h1 className="af-title">Liên kết không hợp lệ</h1>
                    <p className="af-desc">
                        Liên kết thiếu thông tin hoặc đã bị cắt ngắn khi sao chép. Hãy mở lại email mới nhất,
                        hoặc yêu cầu một liên kết mới.
                    </p>
                    <Link className="af-btn af-btn-link" to={ROUTES.FORGOT_PASSWORD}>
                        Yêu cầu liên kết mới
                    </Link>
                    <div className="af-footer">
                        <Link className="af-link" to={ROUTES.LOGIN}>Quay lại đăng nhập</Link>
                    </div>
                </section>
            </main>
        );
    }

    if (done) {
        return (
            <main className="af-page">
                <section className="af-card">
                    <h1 className="af-title">Đã đổi mật khẩu</h1>
                    <p className="af-notice" role="status">
                        Mọi thiết bị đang đăng nhập bằng tài khoản này đã bị đăng xuất. Hãy đăng nhập lại bằng
                        mật khẩu mới.
                    </p>
                    <Link className="af-btn af-btn-link" to={ROUTES.LOGIN}>
                        Đến trang đăng nhập
                    </Link>
                </section>
            </main>
        );
    }

    const inputType = showPassword ? 'text' : 'password';

    return (
        <main className="af-page">
            <section className="af-card">
                <h1 className="af-title">Đặt mật khẩu mới</h1>
                <p className="af-desc">
                    Chọn mật khẩu dài từ {PASSWORD_MIN} đến {PASSWORD_MAX} ký tự. Sau khi lưu, bạn cần đăng
                    nhập lại.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    {error && (
                        <p className="af-error" role="alert">{error}</p>
                    )}

                    <div className="af-field">
                        <label className="af-label" htmlFor="af-new-password">Mật khẩu mới</label>
                        <input
                            id="af-new-password"
                            className="af-input"
                            type={inputType}
                            name="newPassword"
                            autoComplete="new-password"
                            minLength={PASSWORD_MIN}
                            maxLength={PASSWORD_MAX}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="af-field">
                        <label className="af-label" htmlFor="af-confirm-password">Nhập lại mật khẩu mới</label>
                        <input
                            id="af-confirm-password"
                            className="af-input"
                            type={inputType}
                            name="confirmPassword"
                            autoComplete="new-password"
                            maxLength={PASSWORD_MAX}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <label className="af-check">
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                        />
                        Hiện mật khẩu
                    </label>

                    <button type="submit" className="af-btn" disabled={loading}>
                        {loading ? 'Đang lưu…' : 'Lưu mật khẩu mới'}
                    </button>
                </form>

                <div className="af-footer">
                    <Link className="af-link" to={ROUTES.FORGOT_PASSWORD}>Yêu cầu liên kết mới</Link>
                    <Link className="af-link" to={ROUTES.LOGIN}>Quay lại đăng nhập</Link>
                </div>
            </section>
        </main>
    );
}