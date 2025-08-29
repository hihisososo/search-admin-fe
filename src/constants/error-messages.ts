export const ERROR_MESSAGES: Record<string, string> = {
  '500': '서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  '401': '로그인이 필요합니다.',
  '403': '접근 권한이 없습니다.',
  '404': '요청한 리소스를 찾을 수 없습니다.',
  'default': '오류가 발생했습니다.'
}

export const getErrorMessage = (error: Error, customMessage?: string): string => {
  if (customMessage) return customMessage
  
  for (const [code, message] of Object.entries(ERROR_MESSAGES)) {
    if (code === 'default') continue
    if (error.message.includes(code) || 
        (code === '500' && error.message.includes('서버 내부 오류'))) {
      return message
    }
  }
  
  return error.message || ERROR_MESSAGES.default
}