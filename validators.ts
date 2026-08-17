export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

export function validateUsername(username: string): string | null {
  if (!username) return "Введите имя пользователя"
  if (!USERNAME_REGEX.test(username)) {
    return "3–20 символов: буквы, цифры, подчёркивание"
  }
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return "Введите пароль"
  if (password.length < 6) return "Минимум 6 символов"
  return null
}

export function validateInviteCode(code: string): string | null {
  if (!code) return "Введите invite code"
  if (!/^[A-Za-z0-9]{41}$/.test(code)) return "Неверный формат invite code"
  return null
}
