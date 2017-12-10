'use strict';

const FIELD_CHAPTER_NUMBER = document.querySelector('.header--short'),
  FIELD_CHAPTER_TITLE = document.querySelector('.header__title'),
  FIELD_PAGE_NUMBER = document.querySelector('.footer--short'),
  SLIDES = document.querySelectorAll('section:not([hidden])');

let currentSlide = 0,
  slideFrames;

// swipe gesture handling, detect swipes to left and right
function swipedetect(touchsurface, callback){
  let swipedir,
  startX,
  distX,
  threshold = 150, //required min distance traveled to be considered swipe
  allowedTime = 300, // maximum time allowed to travel that distance
  elapsedTime,
  startTime;

  touchsurface.addEventListener('touchstart', e => {
    var touchobj = e.changedTouches[0];
    swipedir = undefined;
    startX = touchobj.pageX;
    startTime = new Date().getTime();
    e.preventDefault();
  }, false);

  touchsurface.addEventListener('touchmove', e => {
    e.preventDefault(); // prevent scrolling when inside DIV
  }, false);

  touchsurface.addEventListener('touchend', e => {
    var touchobj = e.changedTouches[0];
    distX = touchobj.pageX - startX;
    elapsedTime = new Date().getTime() - startTime;
    if (elapsedTime <= allowedTime && Math.abs(distX) >= threshold) {
      swipedir = (distX < 0)? 'left' : 'right';
    }
    callback(swipedir);
    e.preventDefault();
  }, false);
}

// show previous slide
function slideLeft() {
  let newSlide = currentSlide-1;
  if (newSlide === -1) {
    return;
  }
  transitionSlide(currentSlide, newSlide);
}

// show next slide
function slideRight() {
  if (showNextFrame()) {
    return;
  }
  let newSlide = currentSlide+1;
  if (newSlide === SLIDES.length) {
    return;
  }
  transitionSlide(currentSlide, newSlide);
}

// show the next frame inside a slide
function showNextFrame() {
  if (slideFrames && slideFrames.length > 0) {
    let frame = slideFrames.shift();
    requestAnimationFrame(() => frame.classList.add('show'))
    return true;
  }
  return false;
}

// react to the end of the header text fade out -> fade in the next header text
function textFadeoutEnd() {
  FIELD_CHAPTER_TITLE.removeEventListener('transitionend', textFadeoutEnd);
  const titleElem = SLIDES[currentSlide].querySelector('.section__title h1');
  FIELD_CHAPTER_TITLE.textContent = titleElem.textContent;
  requestAnimationFrame(() => FIELD_CHAPTER_TITLE.style.opacity = 1);
}

// transition from slide to slide
function transitionSlide(oldSlide, newSlide) {
  requestAnimationFrame(() => {
    // pages need to slide back to the right when reversing
    if (oldSlide !== undefined && newSlide < oldSlide) {
      SLIDES[oldSlide].style.removeProperty('transform');
    }

    currentSlide = newSlide;
    window.location.hash = newSlide;
    const slide = SLIDES[newSlide];
    slide.style.transform = 'translateX(0)';

    // update displayed data
    FIELD_CHAPTER_NUMBER.textContent = slide.dataset.chNr;
    const titleElem = slide.querySelector('.section__title h1');
    if (titleElem && titleElem.textContent !== FIELD_CHAPTER_TITLE.textContent) {
      if (~~FIELD_CHAPTER_TITLE.style.opacity === 0) {
        // no text shown => show text directly
        FIELD_CHAPTER_TITLE.textContent = titleElem.textContent;
        FIELD_CHAPTER_TITLE.style.opacity = 1;
      } else {
        // already a header text there => fade out the old one and then fade in the new one
        FIELD_CHAPTER_TITLE.addEventListener('transitionend', textFadeoutEnd);
        FIELD_CHAPTER_TITLE.style.opacity = 0;
      }
    }
    FIELD_PAGE_NUMBER.textContent = newSlide;
    slideFrames = Array.prototype.slice.call(slide.querySelectorAll('.slide__frame:not(.show)'));
    adjustHeaderAndFooter();
  });
}

// don't show header and footer on the title page
function adjustHeaderAndFooter() {
  if (currentSlide === 0) {
    document.querySelector('.page__header').style.opacity = '0';
    document.querySelector('.page__footer').style.opacity = '0';
  } else {
    document.querySelector('.page__header').style.removeProperty('opacity');
    document.querySelector('.page__footer').style.removeProperty('opacity');
  }
}

// evaluate links from one slide to another (mostly table of contents)
function clickSlideshowLink(event) {
  const targetSlide = loadHashFromAddress(event.target);
  if (currentSlide !== targetSlide) {
    transitionSlide(currentSlide, targetSlide);
  }
}

// used to load the hash (slide number) from the URL
function loadHashFromAddress(source) {
  try {
    const querySlide = ~~source.location.hash.slice(1);
    if (querySlide >= 0 && querySlide < SLIDES.length) {
      return querySlide;
    }
  } catch(e) {}
  return 0;
}

const pageToLoad = loadHashFromAddress(window);

// generate table of contents and chapter numbers
let tableOfContents = document.querySelector('.table-of-contents'),
  tocFragment = document.createDocumentFragment(),
  tocEntry, tocLink, slideNr, slide, chapterNr = 0, lastChapter = '',
  slidesCount = SLIDES.length, slideTitleElem, slideHeaderElem, chapterNrElem;
for (slideNr = 0; slideNr < slidesCount; slideNr++) {
  slide = SLIDES[slideNr];
  // mark slides up to the current one as 'shown'
  if (slideNr <= pageToLoad) {
    slide.style.transform = 'translateX(0)';
  }
  slide.style.zIndex = slideNr;
  // table of contents entries must be a chapter and it must be a different chapter then before
  if (slide.classList.contains('chapter')) {
    slideTitleElem = slide.querySelector('.section__title h1');
    slideHeaderElem = slide.querySelector('.section__title');
    if (slideTitleElem.textContent !== lastChapter) {
      tocEntry = document.createElement('li');
      tocLink = document.createElement('a');
      tocLink.textContent = slideTitleElem.textContent;
      tocLink.setAttribute('href', `#${slideNr}`)
      tocEntry.appendChild(tocLink);
      tocFragment.appendChild(tocEntry);
      lastChapter = slideTitleElem.textContent;
      chapterNr++;
    }
    slide.dataset.chNr = chapterNr;
    chapterNrElem = document.createElement('div');
    chapterNrElem.textContent = chapterNr;
    slideHeaderElem.insertBefore(chapterNrElem, slideTitleElem);
  }
}
tableOfContents.appendChild(tocFragment);

// load first/requested slide
transitionSlide(undefined, pageToLoad);

// set listener for left/right buttons
document.addEventListener('keyup', (event) => {
  const code = event.which || event.keyCode;
  switch (code){
    case 37: slideLeft(); break;
    case 39: slideRight(); break;
    default: // nothing to do
  }
});

// set listener for mouse wheel
document.addEventListener('wheel', (event) => {
  if (event.wheelDeltaY > 0) {
    slideLeft();
  } else if (event.wheelDeltaY < 0) {
    slideRight();
  }
});

// set swipe detection for touch screens
swipedetect(document.querySelector('body'), swipedir => {
  switch (swipedir) {
    case 'left': slideRight(); break;
    case 'right': slideLeft(); break;
    default: // nothing to do
  }
});

// set listener for interpresentation links
window.addEventListener('hashchange', clickSlideshowLink);
