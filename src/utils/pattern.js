const PatternCheck = {
  password_check(password) {
    /**
     * 密码格式校验
     * 密码位数在6-20位之间，密码不能只包含数字或字母
     * 密码不能含有特殊字符，只能包含数字和字母
     * @param password
     * @type {RegExp}
     */
    const reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/;

    if (password.length < 6 || password.length > 20) {
      return { valid: false, error: "login.password_length_error" };
    }
    if (/^[0-9]+$/.test(password)) {
      return { valid: false, error: "login.password_only_number_error" };
    }
    if (/^[a-zA-Z]+$/.test(password)) {
      return { valid: false, error: "login.password_only_letter_error" };
    }
    if (!reg.test(password)) {
      return { valid: false, error: "login.password_illegal_error" };
    }

    return { valid: true, error: null };
  },

  username_check(username) {
    /**
     * 用户名格式校验
     * 用户名长度在6-20位之间，只能包含数字、字母、下划线(_)、减号(-)
     * @param username
     * @type {RegExp}
     */
    const reg = /^[a-zA-Z0-9_-]{6,20}$/;

    if (username.length < 6 || username.length > 20) {
      return { valid: false, error: "login.username_length_error" };
    }
    if (!reg.test(username)) {
      return { valid: false, error: "login.username_illegal_error" };
    }

    return { valid: true, error: null };
  }
};

export default PatternCheck; // 导出对象