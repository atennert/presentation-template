# Presentation template

This is a template for presentations written in HTML, JavaScript and CSS. I know, this isn't the first one. There are other options out there. I know of at least one. This other one used libraries though and I found it to be to complicated to spend time on, so I created this.

## Requirements
* Sass compiler, to compile the scss file
* Modern browser to show the presentation (I've tested with Chrome and Opera)

## Quick start
* Compile the style.scss to style.css
* Add your content to the index.html file
* Open the index.html file in your browser
* (Simple layout change: change the main and secondary color in the top of the style.scss and recompile it)

## Features
* Fancy layout
* Basic animations
  * Slides coming in from the right when showing next slide
  * Slides go back to the right when showing previous slide
  * Parts of the slide content can be fade one after another with the 'next' action
  * Fading animation for the chapter title
* Various actions for 'next' and 'previous'
  * Keyboard: right and left buttons
  * Mouse wheel: up and down (useful for quick skimming over the content)
  * Swipe gestures (for touch devices): left and right swipe
* Automatically generated table of contents with linking to slides
* Page header and footer are not shown on title page
* Progress bar at the bottom
* Printing style sheet, which removes the fancy stuff, so it's possible to create a 'clean' print version
* The slides are referenced by the hash number in the URL. It can be used to jump to pages directly

## Introduction to writing slides
It's only necessary to work in the `page__content` element and set title stuff in the footer if you like.

The `page__content` contains `section` elements from HTML5. These are the slides. The first section has the class `title` and is the title page. It has no header or footer. Set all the title stuff in this section.

Between `title` and `table of content`, there can be put some simple sections for introduction.

The next section in the template is the `table of contents`. It has only a list, which will contain the chapters. The list is automatically generated. It can be removed, if it is not required.

After the table of contents is the `chapter` slides (marked with the `chapter` class). Those are, where the content goes. Every `chapter` section needs to have a header with the class `section__title` with an h1 element with the title in it. This will be shown in the page header. Besides that the content be whatever is desired.

Finally, there is `slide__frame`. All the tags, which are marked with this tag will be displayed one after another when pressing, scrolling or swiping next. This way it's possible to show only parts of a slides content first and then more, when moving on.

## Completeness
Well, so far I made this template as complete as I need it. That goes mostly for the styling part. For instance, only h1 and h2 tags are properly styled in the content.

If you'd like to have something added, then create an issue or feel free to implement it and create a pull request.
