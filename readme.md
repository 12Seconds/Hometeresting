# Introduction
본 프로젝트는 한국산업기술대학교 졸업작품을 위해 만들었습니다.
해당 프로젝트의 기능은 설치 과정 없이 웹에서 3D 공간을 만들고, 편집할 수 있으며
이를 사람들과 쉽게 공유할 수 있습니다. 또한 해당 공간을 웹에서 VR로 볼 수 있습니다.
그리고 싸이월드를 3D화 한 것과 같이 사진, 영상, 게시글을 업로드 하여 이를
3D 오브젝트에 입혀 공유할 수 있으며, 음성 및 텍스트 채팅을 지원하고 있습니다.

# Developers
Team ODD - IDEA (O.I)
 - 2012152049 황송식
 - 2012150023 배근빈
 - 2012154036 이인행
 - 개발 기간 : 2017.09. ~ 2018.07.
 - 전체 소스코드 : https://github.com/12Seconds/Hometeresting
 
# Demo Video
- http://mikabin.tistory.com/3
 
# Development Environment
- Front-end : Javascript, CSS, Three.js, Physi.js, RTCMultiConnection.js, Galleria, Bootstrap, Jquery, Jquery-ui
- Back-end : AWS Linux(EC2), Django, NodeJS
- DB : sqlite3

# Usage
- Django 프로젝트에 최종 소스코드(완성본)\html 안에 있는 파일들을 넣습니다.
- 최종 소스코드(완성본)\서버\rtcmulticonnection-v3 에서 서버를 구동 합니다.
- sudo node server.js
- sudo node multiPlayServer.js
- 실제 동작 URL : https://www.oddidea.xyz/  (현재 도메인 기간 만료, 인스턴스 중지해 놓은 상태)

# Frontend
- asset
  - 무료 3D 오브젝트를 JSON 형태로 convert 후 저장해 놓은 상태
  - JSON convert를 위해 Unity에서 Threejs Exporter 라이브러리를 사용
- OI_Assets.js
  - JSON 형태의 3D 오브젝트들을 로드한 후, 배열에 담아놓은 상태
  - 연산량은 많아지지만, Smooth Shading을 통해 에셋의 꺾어지는 부분들을 부드럽게 처리되도록 계산 (linear interpolation 원리)
- OI_AssetDic.js
  - OI_Assets에서 로딩 후 배열에 담아놓은 에셋들을 편하게 사용하기 위해 Mapping 처리
  - Python에서 Dictionary 형태와 같이 bed0 : oi.Assets.bedAsset[0] 의 형태로 맵핕
- OI_Camera.js
  - FuctureFreeCamera 라는 커스텀 카메라를 바탕으로 해당 프로젝트에 맞게 수정한 형태
  - 미끄러짐 방지, 회전 축 이상 해결, Q와 E키 구현 등
- OI_Event.js
  - 구현한 거의 모든 JS를 인자로 받고, 대부분의 이벤트를 동작시키는 core JS
  - 매우 높은 결합도로 잘못된 설계를 바탕으로 구현, 페어 프로그래밍 경험
- OI_FrameEvent.js
  - 3D 오브젝트 중 액자 에셋을 클릭했을 때 동작하는 이벤트 구현
  - 대표 이미지 설정, 방의 주인이 올려놓은 사진 등을 볼 수 있음
  - 혼자 하는 테스트 플레이와, 여러 사람이 있는 멀티플레이 모드 두 방식을 나눠서 구현한 상태
  - galleria.js 를 사용
- OI_RTC.js
  - 실시간 음성채팅 및 텍스트채팅을 동작시키는 이벤트 구현
  - RTCMultiConnection.js와 socket.io를 바탕으로 구현
- OI_TestPlay.js
  - 3인칭 시점에서 1인칭 시점으로 변화하는 TestPlay 이벤트 구현
  - 1인칭 시점 변화를 위해 PointerLock을 사용 했으며, testPlay용 카메라를 이용
  - 물리엔진 구현을 위해 physiJS를 사용
- OI_VR_Scene.js
  - ThreeJS의 GearVRController 를 사용하여 VR에서 카메라 이동 구현
  - 삼성 GearVR의 Controller를 이용하여 테스트 했으며, 해당 컨트롤러를 통해 카메라를 이동시킴

# Backend
- server.js
  - RTCMultiConnectio에서 제공하는 NodeJS 서버를 해당 프로젝트에 맞게 수정
  - SSL 적용 및 해당 프로젝트의 socket.io.js에 접근이 가능하도록 수정
- multiPlayServer.js
  - 1인칭 시점에서 여러 사람이 방에 참여하여 큐브의 움직임을 볼 수 있는 멀티플레이 서버 구현
  - NodeJS와 socket.io를 이용하여 구현해 놓은 상태