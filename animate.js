function handleAnimation() {
    document.body.style.display = 'block';
    
    
    function animateElement(element, selector, animationOptions) {
        try {
          if (selector) {
            gsap.from(element.querySelectorAll(selector), animationOptions);
          } else {
            gsap.from(element, animationOptions);
          }
        } catch (error) {
          // Если что-то пошло не так
        }
      }
      
      document.querySelectorAll('[animate]').forEach((element) => {
        // Разделение текста
        let wordsSplit = new SplitType(element, {
          types: 'lines, words, chars',
          tagName: 'span',
        });
      
        // Определяем селектор для разделения
        let selector;
        if (element.hasAttribute('lines')) {
          selector = ' .line';
        } else if (element.hasAttribute('words')) {
          selector = ' .word';
        } else if (element.hasAttribute('chars')) {
          selector = ' .char';
        } else if (element.hasAttribute('paragraphs')) {
          selector = '';  // для paragraphs
        } else {
          selector = ' .word';  // слово по умолчанию
        }
      
        // Определяем тип анимации. Если атрибут 'animate' отсутствует, используем 'slide' по умолчанию.
        let animationType = element.getAttribute('animate') || 'slide';
      
        let animationOptions = {
          duration: parseFloat(element.getAttribute('duration') || 0.8),
          stagger: parseFloat(element.getAttribute('stagger') || 0.01),
          opacity: parseFloat(element.getAttribute('opacity') || 1),
          rotationZ: parseFloat(element.getAttribute('rotation') || 0),
          x: parseFloat(element.getAttribute('dx') || 0),
          y: parseFloat(element.getAttribute('dy') || 0),
          ease: 'power4.inOut'
        };
      
        switch (animationType) {
          case 'slide':
            animationOptions.opacity = element.getAttribute('opacity') || '1';
            animationOptions.y = element.getAttribute('y') || '300%';
            break;
          case 'rotate':
            animationOptions.opacity = element.getAttribute('opacity') || '0.3';
            animationOptions.rotationZ = element.getAttribute('rotation') || '10';
            animationOptions.y = element.getAttribute('y') || '300%';
            break;
          case 'scrub':
            animationOptions.opacity = element.getAttribute('opacity') || '0.2';
            animationOptions.stagger = element.getAttribute('stagger') || '0.2';
            break;
          default:
            return;
        }
      
        function transformAttributeValue(value) {
          return value.split(',').map(val => `${val.trim()}%`).join(' ');
        }
      
        if (element.hasAttribute('scroll')) {
          const startValue = element.getAttribute('starts');
          const endValue = element.getAttribute('end');
      
          animationOptions.scrollTrigger = {
            trigger: element,
            start: startValue ? transformAttributeValue(startValue) : '0% 100%',
            end: endValue ? transformAttributeValue(endValue) : '100% 50%',
          };
      
          if (element.hasAttribute('marker')) {
            animationOptions.scrollTrigger.markers = true;
          }
      
          if (element.hasAttribute('pin')) {
            animationOptions.scrollTrigger.pin = true;
          }
        }
      
        if (element.hasAttribute('scrub')) {
          if (!animationOptions.scrollTrigger) {
            animationOptions.scrollTrigger = {};
          }
          animationOptions.scrollTrigger.scrub = true;
          animationOptions.ease = 'none';
        }
      
        // Применить анимацию сразу
        animateElement(element, selector, animationOptions);
      
        // Если есть атрибут 'hover', то проигрывать анимацию при наведении
        if (element.hasAttribute('hover')) {
          element.addEventListener('mouseenter', () => {
            animateElement(element, selector, animationOptions);
          });
        }
      });
      
      // Добавление стилей для .line
      let style = document.createElement('style');
      style.innerHTML = `
        .line {
          overflow: hidden !important;
          padding-bottom: 0.1em;
          margin-bottom: -0.1em;
          transform-origin: bottom;
        }
      `;
      

     document.head.appendChild(style);

  
  
     
    //Проявления элементов при скролле
    document.querySelectorAll('[fade-in]').forEach(el => {
        gsap.fromTo(
            el,
            {
                opacity: 0
            },
            {
                opacity: 1.5,
                duration: 2,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%', 
                                  }
            }
        );
        });
        
    };



   
    window.addEventListener('load', handleAnimation);
    window.addEventListener('resize', handleAnimation);


    
    document.addEventListener("DOMContentLoaded", () => {
      let headerElement = document.querySelector("[data-scroll='header']");
      let sectionElement = document.querySelector("[data-scroll='section']");
  
      if (headerElement && sectionElement) {
          ScrollTrigger.create({
              trigger: sectionElement,
              start: "top -15%",  // начало анимации, когда верх элемента section поднимается до -15% от высоты экрана
              end: "top -30%",    // конец анимации, когда верх элемента section поднимается до -30% от высоты экрана
              onEnter: () => {
                  gsap.to(headerElement, {
                     backgroundColor: "hsla(240, 11%, 2%, 1.00)",
                      boxShadow: "0 -6px 15px 13px hsla(0, 0.00%, 0.00%, 0.15)",
                      duration: 0.5
                  });
              },
              onLeaveBack: () => {
                  gsap.to(headerElement, {
                      backgroundColor: "", // или другой цвет по умолчанию
                      boxShadow: "",       // или другой boxShadow по умолчанию
                      duration: 0.5
                  });
              }
          });
      }
  });
  


  window.addEventListener("load", function() {
    const flagObject = document.querySelector('[flag]');
    const secondBlock = document.querySelector('[data-round]');
    const presentationSections = document.querySelectorAll('[presentation-section]')

    gsap.to(flagObject, {
        scrollTrigger: {
            trigger: flagObject,
            start: "bottom bottom",
            end: "bottom -10000%",
            pin: true,
            pinSpacing: false,
        }
    });

    gsap.to(flagObject, {
        x: '20%', 
        scrollTrigger: {
            trigger: secondBlock,
            start: 'top bottom',
            end: 'top center',
            scrub: true,
        }
    });

    presentationSections.forEach((section) => {
      gsap.to(section, {
          backgroundColor: '#f13a3d',
          scrollTrigger: {
              trigger: section,
              start: 'center 60%',
              end: 'center 40%',
              toggleActions: 'play reverse play reverse' // play при входе в видимую область, reverse при выходе из видимой области
          }
      });
  });
});

  


gsap.utils.toArray('[data-counterup]').forEach(function (el) {
  // Извлекаем только числовую часть из текстового содержимого элемента
  var matches = el.textContent.match(/(\d+)/);
  var dataNumber = matches ? parseFloat(matches[0]) : 0;

  // Запоминаем нечисловые части содержимого для дальнейшего использования
  var prefix = el.textContent.substr(0, matches.index);
  var suffix = el.textContent.substr(matches.index + matches[0].length);

  // Устанавливаем начальное значение числовой части содержимого как 0
  el.textContent = prefix + '0' + suffix;

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'bottom bottom',
      toggleActions: 'play pause resume pause',
    },
  });

  var target = { val: 0 };
  var duration = parseFloat(el.getAttribute('data-duration')) || 2;

  tl.to(target, {
    val: dataNumber,
    duration: duration,
    onUpdate: function () {
      el.innerText = prefix + Math.round(target.val) + suffix;
    },
  });
});
