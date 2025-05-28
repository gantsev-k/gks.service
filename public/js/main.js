document.addEventListener('DOMContentLoaded', function() {
  // Кэшируем часто используемые элементы
  const db = firebase.firestore();
  console.log("Firestore доступен!");
  
  // 1. Обработка формы обратной связи
  const feedbackForm = document.getElementById('feedbackForm');
  const formStatus = document.getElementById('formStatus');
  
  if (feedbackForm) {
      feedbackForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const name = feedbackForm['name'].value.trim();
          const contact = feedbackForm['contact'].value.trim();
          const message = feedbackForm['message'].value.trim();
          
          if (!name || !contact || !message) {
              formStatus.textContent = '// ошибка: заполните все поля';
              formStatus.style.color = 'red';
              return;
          }
          
          try {
              await db.collection('feedback').add({
                  name: name,
                  contact: contact,
                  message: message,
                  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                  status: 'new'
              });
              
              feedbackForm.reset();
              formStatus.textContent = '// сообщение отправлено. скоро свяжемся';
              formStatus.style.color = 'green';
              
              setTimeout(() => {
                  formStatus.textContent = '';
              }, 5000);
              
          } catch (error) {
              console.error('Error adding document: ', error);
              formStatus.textContent = '// ошибка: не удалось отправить';
              formStatus.style.color = 'red';
          }
      });
  }

  // 2. Обновление года в футере
  const yearElements = document.querySelectorAll('.current-year');
  if (yearElements.length) {
      const currentYear = new Date().getFullYear();
      yearElements.forEach(el => {
          el.textContent = currentYear;
      });
  }

  // 3. Подсветка активного пункта меню
  const navLinks = document.querySelectorAll('.nav-bar__link');
  const sections = document.querySelectorAll('section');
  
  // Оптимизация: кэшируем элементы и добавляем троттлинг
  let lastScroll = 0;
  const scrollHandler = () => {
      const now = Date.now();
      if (now - lastScroll < 100) return; // Троттлинг 100ms
      lastScroll = now;
      
      const scrollPosition = window.scrollY + 100;
      
      sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.clientHeight;
          const sectionId = section.getAttribute('id');
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
              navLinks.forEach(link => {
                  link.removeAttribute('aria-current');
                  if (link.getAttribute('href') === `#${sectionId}`) {
                      link.setAttribute('aria-current', 'page');
                  }
              });
          }
      });
  };

  if (navLinks.length) {
      window.addEventListener('scroll', scrollHandler);
      scrollHandler(); // Инициализация при загрузке
  }

  // 4. Аккордеон FAQ
  const faqItems = document.querySelectorAll('.accordion__item');
  const faqCount = document.getElementById('faqCount');
  
  if (faqCount && faqItems.length) {
      faqCount.textContent = faqItems.length;
  }

  faqItems.forEach(item => {
      const header = item.querySelector('.accordion__header');
      const content = item.querySelector('.accordion__content');
      content.style.maxHeight = '0';
      
      header.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          
          // Закрываем все открытые пункты
          document.querySelectorAll('.accordion__item.active').forEach(activeItem => {
              if (activeItem !== item) {
                  activeItem.classList.remove('active');
                  activeItem.querySelector('.accordion__content').style.maxHeight = '0';
              }
          });

          // Переключаем текущий пункт
          if (isActive) {
              content.style.maxHeight = '0';
              item.classList.remove('active');
          } else {
              content.style.maxHeight = content.scrollHeight + 'px';
              item.classList.add('active');
          }
      });
  });

  // 5. Кнопка "Наверх"
  const scrollToTopBtn = document.querySelector('.scrollToTopBtn');
  
  if (scrollToTopBtn) {
      let scrollTimeout;
      
      const scrollHandler = () => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
              scrollToTopBtn.classList.toggle('show', window.scrollY > 600);
          }, 50);
      };
      
      window.addEventListener('scroll', scrollHandler);
      
      scrollToTopBtn.addEventListener('click', () => {
          window.scrollTo({
              top: 0,
              behavior: 'smooth'
          });
      });
  }
});