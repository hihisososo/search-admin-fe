export default function TestDeploymentPage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">배포 테스트 페이지</h1>
          <p className="text-lg text-gray-600 mb-6">
            이 페이지는 배포가 정상적으로 작동하는지 확인하기 위한 테스트 페이지입니다.
          </p>
          <div className="bg-blue-100 rounded-lg p-4">
            <p className="text-blue-800 font-semibold">
              생성 시간: {new Date().toLocaleString('ko-KR')}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800">배포 상태</h2>
              <p className="text-green-600">✅ 정상 작동 중</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-orange-800">버전 정보</h2>
              <p className="text-orange-600">v1.0.0-test</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}