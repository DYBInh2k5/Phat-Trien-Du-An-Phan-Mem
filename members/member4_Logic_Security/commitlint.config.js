// Quy ước commit (Conventional Commits): <type>(<scope>?): <mô tả>
//   vd: feat(classes): admin phân học sinh vào lớp | fix(auth): thu hồi phiên khi đổi mật khẩu
// type hợp lệ: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Gợi ý scope theo module; không bắt buộc phải có scope
    'scope-enum': [
      1,
      'always',
      [
        'auth',
        'users',
        'classes',
        'grades',
        'conduct',
        'academic',
        'common',
        'db',
        'config',
        'logging',
        'postman',
        'docs',
        'test',
        'deps',
      ],
    ],
  },
};
