/**
 * Supabase 에러 메시지를 한글로 변환
 */
export const translateErrorMessage = (error: string | null | undefined): string => {
  if (!error) return '알 수 없는 오류가 발생했습니다.';

  const errorLower = error.toLowerCase();

  // 인증 관련 에러
  if (errorLower.includes('invalid login credentials') ||
      errorLower.includes('invalid email or password')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }

  if (errorLower.includes('email not confirmed')) {
    return '이메일 인증이 완료되지 않았습니다.';
  }

  if (errorLower.includes('user already registered') ||
      errorLower.includes('user with this email already exists')) {
    return '이미 가입된 이메일입니다.';
  }

  if (errorLower.includes('password should be at least')) {
    return '비밀번호는 6자 이상이어야 합니다.';
  }

  if (errorLower.includes('invalid email')) {
    return '올바르지 않은 이메일 형식입니다.';
  }

  if (errorLower.includes('email rate limit exceeded')) {
    return '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
  }

  // 네트워크 관련 에러
  if (errorLower.includes('network request failed') ||
      errorLower.includes('fetch failed')) {
    return '네트워크 연결을 확인해주세요.';
  }

  if (errorLower.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  }

  // 데이터베이스 관련 에러
  if (errorLower.includes('unique constraint') ||
      errorLower.includes('duplicate key')) {
    return '이미 존재하는 데이터입니다.';
  }

  if (errorLower.includes('foreign key constraint')) {
    return '참조된 데이터가 없습니다.';
  }

  if (errorLower.includes('permission denied') ||
      errorLower.includes('insufficient privileges')) {
    return '권한이 없습니다.';
  }

  if (errorLower.includes('not found')) {
    return '데이터를 찾을 수 없습니다.';
  }

  // JWT/세션 관련 에러
  if (errorLower.includes('jwt expired') ||
      errorLower.includes('token expired')) {
    return '세션이 만료되었습니다. 다시 로그인해주세요.';
  }

  if (errorLower.includes('invalid jwt') ||
      errorLower.includes('invalid token')) {
    return '유효하지 않은 인증 정보입니다. 다시 로그인해주세요.';
  }

  // 서버 에러
  if (errorLower.includes('internal server error') ||
      errorLower.includes('500')) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  if (errorLower.includes('service unavailable') ||
      errorLower.includes('503')) {
    return '서비스를 일시적으로 사용할 수 없습니다.';
  }

  // 기타 일반적인 에러
  if (errorLower.includes('bad request') ||
      errorLower.includes('400')) {
    return '잘못된 요청입니다.';
  }

  // 번역되지 않은 에러는 원본 메시지 반환
  return error;
};
