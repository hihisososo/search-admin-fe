export const formatDate = (dateStr: string | Date) => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDateTime = (dateStr: string | Date) => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

export const formatTimestamp = (timestamp: string) => {
  // 서버가 UTC 문자열을 타임존 없이 주는 경우가 있어 보정
  // 1) 소수점 자릿수를 ms(3자리)로 축약  2) 타임존 누락 시 'Z' 추가 → UTC 파싱
  const hasTz = /[zZ]|[+-]\d{2}:\d{2}$/.test(timestamp)
  const withTz = hasTz ? timestamp : `${timestamp}Z`
  const normalized = withTz.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:\d{2})$/, '.$1$2')
  const date = new Date(normalized)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul'
  })
}

export const formatTime = (dateStr: string | Date) => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}