'use strict';

const SLIDES = document.querySelectorAll('section:not([hidden])'),
  PROGRESS_BAR_CONTAINER = document.querySelector('.progress-bar__container');
  

let currentSlide = 0,
  slideFrames,
  progressBar;

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

// transition from slide to slide
function transitionSlide(oldSlide, newSlide) {
  requestAnimationFrame(() => {
    // pages need to slide back to the right when reversing
    if (oldSlide !== undefined && newSlide < oldSlide) {
      SLIDES[oldSlide].style.removeProperty('transform');
    }

    // set and show next slide
    currentSlide = newSlide;
    window.location.hash = newSlide;
    const slide = SLIDES[newSlide];
    slide.style.transform = 'translateX(0)';

    // set progress bar
    progressBar.style.transform = `translateX(${-100 + 100 * newSlide / (SLIDES.length-1)}%)`;
    slideFrames = Array.prototype.slice.call(slide.querySelectorAll('.slide__frame:not(.show)'));
  });
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
let tableOfContents = document.querySelector('.table-of-contents');
if (!!tableOfContents) {
  let tocFragment = document.createDocumentFragment(),
    tocEntry, tocLink, slideNr, slide, chapterNr = 0, lastChapter = '',
    slidesCount = SLIDES.length, slideTitleElem, slideHeaderElem;
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
      slideTitleElem.textContent = `${chapterNr} ${slideTitleElem.textContent}`;
    }
  }
  tableOfContents.appendChild(tocFragment);
}

// setup progress bar
progressBar = document.createElement('div');
progressBar.classList.add('progress-bar');
progressBar.style.transform = 'translateX(-100%)';
PROGRESS_BAR_CONTAINER.appendChild(progressBar);

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
  if (event.deltaY < 0) {
    slideLeft();
  } else if (event.deltaY > 0) {
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

function getUtcDateString(date) {
  const pad = (n) => n < 10 ? `0${n}` : n;
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}


// set listener for interpresentation links
window.addEventListener('hashchange', clickSlideshowLink);

// set the current date
const time = document.querySelector('time'),
  currentDate = new Date();
time.textContent = currentDate.toLocaleDateString('de-DE', {year: 'numeric', month: 'long', day: 'numeric'});
time.setAttribute('datetime', getUtcDateString(currentDate));
