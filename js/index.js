const KEY_TOKEN = 'your_token_key';
async function sendRequest(url, method, data = null) {
    const requestOptions = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    // Добавление токена авторизации, если он есть
    const token = localStorage.getItem(KEY_TOKEN);
    if (token) {
        requestOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    // Добавление тела запроса для методов POST и PUT
    if (data) {
        requestOptions.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error('Ошибка HTTP: ' + response.status);
        }
        return await response.json();
    } catch (error) {
        console.error('Произошла ошибка:', error);
        throw error;
    }
}   

function initMap() {
    const map = new mapgl.Map('container', {
        center: [74.603605, 42.876467],
        zoom: 13,
        key: '97633a11-4c0a-4af5-b38b-4b96418e7305',
    });
    map.on('click', (e) => {
        if (!e.target) {
            return;
        }
        const { id } = e.target;
        localStorage.setItem('lng', e.lngLat[0]);
        localStorage.setItem('lat', e.lngLat[1]);
        console.log(e.lngLat)
        alert('Идентификатор объекта: ' + id);
    });
    sendRequest('http://34.125.206.123/post/', "GET")
        .then(posts => {
            posts.forEach(post => {
                // Создаем маркер для каждого поста
                const marker = new mapgl.Marker(map, {
                    coordinates: [post?.lng, post?.lat], // Предполагается, что у вас есть координаты для каждого поста
                });

                // Вызов функции для добавления информации о маркере
                MapInfo(marker, post); // Предполагается, что у вас есть описание для каждого поста
            });
        })
        .catch(error => {
            console.error('Ошибка при получении данных о постах:', error);
        });
    
    // ! Функция для добавления информации о маркере
    function MapInfo(marker, post) {
        const tooltipEl = document.querySelector('#tooltip');
        const postInfoEl= document.querySelector('#postInfo')
        const postTitle  = document.querySelector('#postName')
        const postDescription = document.querySelector('#postDescription')
        const postDate = document.querySelector('#postDate')
        const postImage = document.querySelector('#postImage')
        marker.on('mouseover', (event) => {
            const offset = 5;
            tooltipEl.style.position = 'absolute'
            tooltipEl.style.top = `${event.point[1] + offset}px`;
            tooltipEl.style.left = `${event.point[0] + offset}px`;
            tooltipEl.style.display = 'block';
            tooltipEl.innerHTML = post.title;
        });
        marker.on('mouseout', () => {
            tooltipEl.style.display = 'none';
        });
        let postOpen = false; // Флаг для отслеживания состояния поста

        marker.on('click', (event) =>{
            const offset = 5;
            postInfoEl.style.position = 'absolute'
            postInfoEl.style.top = `${event.point[1] + offset}px`;
            postInfoEl.style.left = `${event.point[0] + offset}px`;

            if (!postOpen) {
                postInfoEl.style.display = 'block';
                postImage.src = post?.image;
                postTitle.innerHTML = post?.title;
                postDescription.innerHTML = post?.body;
                postDate.innerHTML = post?.date;
                postOpen = true; // Устанавливаем флаг в состояние "открыт"
            } else {
                postInfoEl.style.display = 'none';
                postOpen = false; // Устанавливаем флаг в состояние "закрыт"
            }
        });
        window.addEventListener('click', function(event) {
            // Проверяем, был ли клик сделан за пределами поста и его маркера, только если пост открыт
            if (postOpen && !postInfoEl.contains(event.target) && event.target !== marker.element) {
                postInfoEl.style.display = 'none'; // Скрываем элемент с информацией о посте
                postOpen = false; // Сбрасываем флаг состояния поста
            }
        });
    }
}
    

//! модальное окно
let modal = document.getElementById("myModal");
let burgerIcon = document.querySelector(".burgerMenu");

async function logout() {
    try {
        // Отправляем запрос на сервер для выхода
        const response = await fetch('http://34.125.206.123/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Если нужно передать токен для аутентификации, добавьте его сюда
                'Authorization': 'Bearer ' + localStorage.getItem('KEY_TOKEN')
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка HTTP: ' + response.status);
        }

        // Удаляем токен из локального хранилища
        localStorage.removeItem('KEY_TOKEN');

        // Перенаправляем пользователя на страницу входа или другую страницу
        window.location.href = '/auth.html'; // Измените адрес по необходимости
    } catch (error) {
        console.error('Ошибка выхода:', error);
        // Обработка ошибки выхода
    }
}
function toggleContainer(containerId) {
    // Скрыть все контейнеры
    const containers = document.querySelectorAll('.contentForUser > div');
    containers.forEach(container => {
        container.style.display = 'none';
    });

    // Показать выбранный контейнер
    const selectedContainer = document.getElementById(containerId);
    if (selectedContainer) {
        selectedContainer.style.display = 'block';
    }
}

function handleTabChange(tabId) {
    // Убрать класс "active" со всех кнопок
    const buttons = document.querySelectorAll('.buttonForUser > .button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    // Добавить класс "active" к выбранной кнопке
    const selectedButton = document.querySelector(`.buttonForUser > .button[data-tab="${tabId}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.getElementById('logoutLink');

    // Проверяем наличие токена в локальном хранилище
    const token = localStorage.getItem('KEY_TOKEN');
    const authElement = document.querySelector('#userIcon')
    // Если токен существует, показываем элемент "Выйти"
    if (token) {
        logoutLink.style.display = 'block';
        authElement.style.display = 'none'

        // Добавляем обработчик события для выхода при клике на элемент "Выйти"
        logoutLink.addEventListener('click', async function(event) {
            event.preventDefault(); // Предотвращаем переход по ссылке

            try {
                // Вызываем функцию logoutA для выхода
                await logout();

                // Удаляем токен из локального хранилища
                localStorage.removeItem('KEY_TOKEN');

                // Перенаправляем пользователя на страницу входа или другую страницу
                window.location.href = '/auth.html'; // Измените адрес по необходимости
            } catch (error) {
                console.error('Ошибка выхода:', error);
                // Обработка ошибки выхода
            }
        });
    } else {
        logoutLink.style.display = 'none';
        authElement.style.display = 'block' // Скрываем элемент "Выйти"
    }
});

burgerIcon.onclick = function() {
    modal.style.display = "block";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
