const PatternCheck = {
  password_check(password) {
    /**
     * 密码格式校验
     * 密码位数在6-20位之间，密码不能只包含数字或字母
     * 密码不能含有特殊字符，只能包含数字和字母
     * @param password
     * @type {RegExp}
     */
    const reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z@]{6,20}$/;

    if (password.length < 6 || password.length > 20) {
      return { valid: false, error: "密码长度应为 6 到 20 个字符" };
    }
    if (/^[0-9]+$/.test(password)) {
      return { valid: false, error: "密码不能只包含数字" };
    }
    if (/^[a-zA-Z]+$/.test(password)) {
      return { valid: false, error: "密码不能只包含字母" };
    }
    if (!reg.test(password)) {
      return { valid: false, error: "密码包含非法字符" };
    }

    return { valid: true, error: null };
  },

  username_check(username) {
    /**
     * 用户名格式校验
     * 用户名长度在1-150位之间 (允许中英文及多种字符，具体规则由后端控制)
     * @param username
     * @type {RegExp}
     */
    // const reg = /^[a-zA-Z0-9_-]{6,20}$/;

    if (!username || username.length < 1 || username.length > 150) {
      return { valid: false, error: "用户名长度应为 1 到 150 个字符" }; 
    }
    // Removing specific regex test to allow broader characters including Chinese, deferring to backend for specific pattern validation.
    // if (!reg.test(username)) {
    //   return { valid: false, error: "login.username_illegal_error" };
    // }

    return { valid: true, error: null };
  },

  phone_check(phoneNumber) {
    /**
     * 手机号格式校验
     * 手机号必须是11位数字。
     * @param phoneNumber
     */
    const reg = /^\d{11}$/;

    if (!phoneNumber) {
      return { valid: false, error: "手机号码不能为空" };
    }
    if (!reg.test(phoneNumber)) {
      return { valid: false, error: "手机号码格式不正确，必须是11位数字" };
    }

    return { valid: true, error: null };
  }
};

export default PatternCheck; // 导出对象