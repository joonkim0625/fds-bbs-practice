import '@babel/polyfill'

import axios from 'axios'



const api = axios.create({
  // 바깥에서 주입해준 환경변수를 사용하는 코드
  // 이 컴퓨터에서만 사용할 환경변수를 설정하기 위해서 .env파일을 편집하면 된다.
  baseURL: process.env.API_URL
})

api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
});

const templates = {
  loginForm: document.querySelector('#login-form').content,
  postList: document.querySelector('#post-list').content,
  postItem: document.querySelector('#post-item').content,
  postForm: document.querySelector('#post-form').content,
  postDetail: document.querySelector('#post-detail').content,
  commentItem: document.querySelector('#comment-item').content,
}

const rootEl = document.querySelector('.root')

// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
// 2. 요소 선택
// 3. 필요한 데이터 불러오기
// 4. 내용 채우기
// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입

async function drawLoginForm() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.loginForm, true)

  // 2. 요소 선택
  const formEl = frag.querySelector('.login-form')

  // 3. 필요한 데이터 불러오기 - 필요없음
  // 4. 내용 채우기 - 필요없음
  // 5. 이벤트 리스너 등록하기
  formEl.addEventListener('submit', async e => {
    e.preventDefault()
    const username = e.target.elements.username.value
    const password = e.target.elements.password.value

    const res = await api.post('/users/login', {
      username,
      password
    })

    localStorage.setItem('token', res.data.token)
    drawPostList()
  })

  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

async function drawPostList() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.postList, true)

  // 2. 요소 선택
  const listEl = frag.querySelector('.post-list')
  // 새글 요소
  const createEl = frag.querySelector('.create')
  // 로그아웃
  const logoutEl = frag.querySelector('.logout')

  // 3. 필요한 데이터 불러오기
  // {data} -> 분해대입을 사용한 것. data를 꺼내와서 바로 변수로 사용 가능.
  // {data: postList} -> data라는 속성 이름을 가져와서 postList에다가 저장하는 것.
  //   const {data: postList} = await api.get("/posts?_embed=user"); === const postList = res.data
  const {data: postList} = await api.get("/posts?_expand=user");

  // 4. 내용 채우기
  for (const postItem of postList) {
    const frag = document.importNode(templates.postItem, true)

    const idEl = frag.querySelector('.id')
    const titleEl = frag.querySelector(".title");
    const authorEl = frag.querySelector(".author");

    idEl.textContent = postItem.id
    titleEl.textContent = postItem.title
    authorEl.textContent = postItem.user.username

    // 게시물 클릭시 게시물 표시
    // 게시물 제목 클릭했을 때 drawPostDetail을 보여주기
    titleEl.addEventListener('click', e => {
      drawPostDetail(postItem.id)
    })

    listEl.appendChild(frag)
  }
  // 5. 이벤트 리스너 등록하기

  createEl.addEventListener('click', e => {
    drawNewPostForm()
  })

  logoutEl.addEventListener('click', e => {
    localStorage.removeItem('token')
    drawLoginForm()
  })

  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

// 게시물을 그리는 함수 -> 때마다 다른 게시물을 보여주기 위해 postId라는 매개변수를 받기로 함.
async function drawPostDetail(postId) {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.postDetail, true)


  // 2. 요소 선택
  const titleEl = frag.querySelector('.title')
  const authorEl = frag.querySelector('.author')
  const bodyEl = frag.querySelector('.body')
  const backEl = frag.querySelector(".back");
  const commentListEl = frag.querySelector('.comment-list')
  // comment input을 위한
  const commentFormEl = frag.querySelector('.comment-form')
  // 수정 버튼을 위한
  const updateEl = frag.querySelector('.update')
  // 삭제를 위한
  const deleteEl = frag.querySelector(".delete");
  // 3. 필요한 데이터 불러오기
  // const {data: {title, body}} 분해대입의 분해대입
  // params는 쿼리스트링을 문자열로 입력하는 대신 객체형태로 입력하여 전해주는 것. 검사 창 네트워크 영역을 통해 확인을 하면서 진행하자.
  const {data: {title, body, user, comments}} = await api.get('/posts/' + postId, {
    params: {
      _expand: 'user',
      _embed: 'comments'

    }
  })

  // 사용자 여러명의 정보를 불러오고 싶을 때 (댓글 기능 - 작성자 보여주기를 위한)
  // const res = await api.get('/users', {
  //   params
  // })
  // const userList = res.data
  // 이 코드들이 밑과 같다.
  const params = new URLSearchParams()
  comments.forEach(c => {
    params.append('id', c.userId)
  })
  const {data: userList} = await api.get('/users', {
    params
  })

  // 4. 내용 채우기

  // titleEl.textContent = data.title
  // bodyEl.textContent = data.body
  titleEl.textContent = title
  bodyEl.textContent = body
  authorEl.textContent = user.username
  // 댓글 표시
  for (const commentItem of comments) {
    // 1. 템플릿 복사
    const frag = document.importNode(templates.commentItem, true)
    // 2. 요소 선택
    const authorEl = frag.querySelector('.author')
    const bodyEl = frag.querySelector('.body')
    const deleteEl = frag.querySelector('.delete')
    // 3. 필요한 데이터 불러오기 - commentItem 안에 다 들어있기 때문에 필요없는 과정.

    // 4. 내용 채우기
    bodyEl.textContent = commentItem.body

    const user = userList.find(item => item.id === commentItem.userId)
    authorEl.textContent = user.username
    // 5. 이벤트 리스너 등록하기

    // 6. 템플릿을 문서에 삽입
    commentListEl.appendChild(frag)
  }

  // 5. 이벤트 리스너 등록하기
  // 코멘트 인풋 폼에 이벤트리스너
  commentFormEl.addEventListener('submit', async e => {
    e.preventDefault()
    const body = e.target.elements.body.value
    // ``을 이용해서 작성, postId(몇번 게시물을 보여주고 있다는 매개변수를 받는 함수안에 있기에 사용!!)
    await api.post(`/posts/${postId}/comments`, {
      body
    })
    drawPostDetail()
  })
  // 삭제하기 - 삭제한 뒤 게시글 목록으로 가야함.

  deleteEl.addEventListener('click', async e => {
    await api.delete('/posts/' + postId)
    drawPostList()
  })

  // 수정하기
  updateEl.addEventListener('click', e => {
    drawEditPostForm(postId)
  })

  // 뒤로가기 버튼

  backEl.addEventListener('click', e => {
    drawPostList()
  })
  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

// 새글 추가를 위한
async function drawNewPostForm() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.postForm, true)
  // 2. 요소 선택
  const formEl = frag.querySelector('.post-form')
  const backEl = frag.querySelector('.back')

  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기


  formEl.addEventListener('submit', async e => {
    e.preventDefault()
    const title = e.target.elements.title.value
    const body = e.target.elements.body.value

    await api.post('/posts', {
      title,
      body
    })
    drawPostList()
  })

  backEl.addEventListener("click", e => {
    // 브라우저에 내재된 버튼의 기본 기능작동을 방지하기 위한 프리벤트 설정.
    e.preventDefault()
    drawPostList();
  });



  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

// 글 수정
async function drawEditPostForm(postId) {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.postForm, true)
  // 2. 요소 선택
  const formEl = frag.querySelector('.post-form')
  const backEl = frag.querySelector('.back')
  const titleEl = frag.querySelector('.title')
  const bodyEl = frag.querySelector('.body')

  // 3. 필요한 데이터 불러오기
  const {data: {title, body}} = await api.get('/posts/' + postId)
  // 4. 내용 채우기
  // 이런 식의 작성은 필드에 기존값이 채워진 채로 표시가 된다.
  titleEl.value = title
  bodyEl.value = body
  // 5. 이벤트 리스너 등록하기


  formEl.addEventListener('submit', async e => {
    e.preventDefault()
    const title = e.target.elements.title.value
    const body = e.target.elements.body.value
    // 수정을 해주어야 하니 patch를 사용.
    await api.patch('/posts/' + postId, {
      title,
      body
    })
    drawPostList()
  })

  backEl.addEventListener("click", e => {
    // 브라우저에 내재된 버튼의 기본 기능작동을 방지하기 위한 프리벤트 설정.
    e.preventDefault()
    drawPostList();
  });



  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

// 페이지 로드 시 그릴 화면 설정
if (localStorage.getItem('token')) {
  drawPostList()
} else {
  drawLoginForm()
}
