/**
 * Set controls for UI modals
 * @module modules/modal
 * @author Ailip <ailip@metropolia.fi>
 * @author vilhov <vilhov@metropolia.fi>
 */

/**
 *
 */
const setModalControls = () => {
  // Get the modal
  const modal = document.getElementById("myModal");
  // Get the button that opens the modal
  const btn = document.getElementById("corona-info-container");
  // Get the <span> element that closes the modal
  const span = document.querySelector(".close");
  // Get Corona slides
  const slides = document.querySelector('.slideshow-container');
  // When the user clicks on the button, open the modal


    btn.addEventListener('click', () => {
      if(window.innerWidth <= 735){
        modal.style.display = "flex";
        document.getElementsByTagName('body')[0].style.overflow = 'hidden';
      }
    });


  // When the user clicks on <span> (x), close the modal
  span.addEventListener('click', () => {
    modal.style.display = "none";
    document.getElementsByTagName('body')[0].style.overflow = 'visible';

  });
  // When the user clicks anywhere outside of the modal, close it
  document.addEventListener('click', (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
      document.getElementsByTagName('body')[0].style.overflow = 'visible';

    }
  });
};

export {setModalControls};
