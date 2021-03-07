/**
 * Set controls for UI modals
 * @module modules/modal
 */
const setModalControls = () => {
  // Get the modal
  const modal = document.getElementById("myModal");
  // Get the button that opens the modal
  const btn = document.getElementById("corona-info-container");
  // Get the <span> element that closes the modal
  const span = document.getElementsByClassName("close")[0];
  // Get Corona slides
  const slides = document.querySelector('.slideshow-container');
  // When the user clicks on the button, open the modal


    btn.addEventListener('click', () => {
      if(window.innerWidth <= 735){
        modal.style.display = "flex";
        document.body.style.position = 'fixed';
      }
    });


  // When the user clicks on <span> (x), close the modal
  span.addEventListener('click', () => {
    modal.style.display = "none";
    document.body.style.position = 'static';

  });
  // When the user clicks anywhere outside of the modal, close it
  document.addEventListener('click', (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
      document.body.style.position = 'static';

    }
  });
};

export {setModalControls};
