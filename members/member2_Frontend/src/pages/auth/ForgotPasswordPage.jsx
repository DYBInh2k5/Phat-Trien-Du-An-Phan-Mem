import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client.js';
import { ROUTES } from '../../constants/routes.js';
import './AuthForms.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sentMessage, setSentMessage] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        const value = email.trim();
        if (!EMAIL_REGEX.test(value)) {
            setError('Email chưa đúng định dạng. Ví dụ: ten@example.com');
            return;
        }

        setLoading(true);
        try {
            const data = await apiClient('/auth/forgot-password', {
                method: 'POST',
                body: { email: value },
            });
            setSentMessage(
                data?.message ||
                'Nếu email này đã đăng ký trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.'
            );
        } catch (err) {
            setError(err?.message || 'Không gửi được yêu cầu. Kiểm tra kết nối mạng rồi thử lại.');
        } finally {
            setLoading(false);
        }
    }

    if (sentMessage) {
        return (
            <main className="af-page">
                <section className="af-card">
                    <h1 className="af-title">Kiểm tra hộp thư của bạn</h1>
                    <p className="af-notice" role="status">{sentMessage}</p>
                    <p className="af-desc">
                        Liên kết có hiệu lực trong 15 phút và chỉ dùng được một lần. Chưa thấy email? Hãy xem
                        mục Spam, hoặc chờ khoảng một phút rồi gửi lại.
                    </p>
                    <button
                        type="button"
                        className="af-btn af-btn-secondary"
                        onClick={() => {
                            setSentMessage('');
                            setEmail('');
                        }}
                    >
                        Nhập email khác
                    </button>
                    <div className="af-footer">
                        <Link className="af-link" to={ROUTES.LOGIN}>Quay lại đăng nhập</Link>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="af-page">
            <section className="af-card">
                <h1 className="af-title">Quên mật khẩu</h1>
                <p className="af-desc">
                    Nhập email đã đăng ký với tài khoản. Chúng tôi sẽ gửi liên kết để bạn đặt mật khẩu mới.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    {error && (
                        <p className="af-error" role="alert">{error}</p>
                    )}

                    <div className="af-field">
                        <label className="af-label" htmlFor="af-email">Email</label>
                        <input
                            id="af-email"
                            className="af-input"
                            type="email"
                            name="email"
                            autoComplete="email"
                            inputMode="email"
                            maxLength={255}
                            placeholder="ten@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                            autoFocus
                        />
                    </div>

                    <button type="submit" className="af-btn" disabled={loading}>
                        {loading ? 'Đang gửi…' : 'Gửi liên kết đặt lại'}
                    </button>
                </form>

                <div className="af-footer">
                    <Link className="af-link" to={ROUTES.LOGIN}>Quay lại đăng nhập</Link>
                </div>
            </section>
        </main>
    );
}