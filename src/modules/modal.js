/**
 * Set controls for UI modals
 * @module modules/modal
 */
const setModalControls = () => {
  // Get the modal
  const modal = document.getElementById("myModal");
  // Get the button that opens the modal
  const btn = document.getElementById("trigger");
  // Get the <span> element that closes the modal
  const span = document.getElementsByClassName("close")[0];
  // When the user clicks on the button, open the modal
  btn.addEventListener('click', () => {
    modal.style.display = "block";
  });
  // When the user clicks on <span> (x), close the modal
  span.addEventListener('click', () => {
    modal.style.display = "none";
  });
  // When the user clicks anywhere outside of the modal, close it
  document.addEventListener('click', (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
};

export {setModalControls};
