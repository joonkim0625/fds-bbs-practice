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



  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

// 게시물을 그리는 함수 -> 때마다 다른 게시물을 보여주기 위해 postId라는 매개변수를 받기로 함.
async function drawPostDetail(postId) {
  // 1. 템플릿 복사
  // 2. 요소 선택
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
}

async function drawNewPostForm() {
  // 1. 템플릿 복사
  // 2. 요소 선택
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
}

async function drawEditPostForm(postId) {
  // 1. 템플릿 복사
  // 2. 요소 선택
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
}

// 페이지 로드 시 그릴 화면 설정
if (localStorage.getItem('token')) {
  drawPostList()
} else {
  drawLoginForm()
}
