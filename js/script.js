// Main JavaScript for Discover Lesotho
document.addEventListener("DOMContentLoaded", function () {
  // Update the footer year
  document.querySelectorAll(".current-year").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  // Light and dark theme. The selected theme is saved in localStorage.
  const themeButtons = document.querySelectorAll("#themeToggle");
  const savedTheme = localStorage.getItem("discoverLesothoTheme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  function updateThemeButtons() {
    themeButtons.forEach(function (button) {
      const darkModeOn = document.body.classList.contains("dark-mode");
      button.textContent = darkModeOn ? "Light mode" : "Dark mode";
      button.setAttribute("aria-pressed", String(darkModeOn));
      button.setAttribute("aria-label", darkModeOn ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  updateThemeButtons();

  themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
      const selectedTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
      localStorage.setItem("discoverLesothoTheme", selectedTheme);
      updateThemeButtons();
    });
  });

  // Destination search and category filtering
  const searchInput = document.getElementById("destinationSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const destinationItems = document.querySelectorAll(".destination-item");
  const categoryButtons = document.querySelectorAll(".category-button");
  const destinationCount = document.getElementById("destinationCount");
  const noDestinations = document.getElementById("noDestinations");
  const clearFilters = document.getElementById("clearFilters");
  let selectedCategory = "all";

  function updateCategoryButtons() {
    categoryButtons.forEach(function (button) {
      const isSelected = button.dataset.category === selectedCategory;
      button.classList.toggle("btn-success", isSelected);
      button.classList.toggle("btn-outline-success", !isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
  }

  function filterDestinations() {
    if (!destinationItems.length) return;
    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";
    let visibleCount = 0;

    destinationItems.forEach(function (item) {
      const textToSearch = ((item.dataset.search || "") + " " + item.textContent).toLowerCase();
      const categories = (item.dataset.category || "").split(/\s+/);
      const matchesSearch = textToSearch.includes(searchText);
      const matchesCategory = selectedCategory === "all" || categories.includes(selectedCategory);
      const shouldShow = matchesSearch && matchesCategory;
      item.hidden = !shouldShow;
      if (shouldShow) visibleCount++;
    });

    if (destinationCount) {
      destinationCount.textContent = "Showing " + visibleCount + " of " + destinationItems.length + " destinations";
    }
    if (noDestinations) noDestinations.hidden = visibleCount !== 0;
    updateCategoryButtons();
  }

  if (searchInput) searchInput.addEventListener("input", filterDestinations);

  if (categoryFilter) {
    categoryFilter.addEventListener("change", function () {
      selectedCategory = categoryFilter.value;
      filterDestinations();
    });
  }

  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectedCategory = button.dataset.category || "all";
      if (categoryFilter) categoryFilter.value = selectedCategory;
      filterDestinations();
    });
  });

  if (clearFilters) {
    clearFilters.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      if (categoryFilter) categoryFilter.value = "all";
      selectedCategory = "all";
      filterDestinations();
    });
  }
  filterDestinations();

  // Bootstrap modal for destination cards
  const destinationModalElement = document.getElementById("destinationModal");
  const detailButtons = document.querySelectorAll(".destination-details");
  const modalTitle = document.getElementById("destinationModalTitle");
  const modalBody = document.getElementById("destinationModalBody");

  detailButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (!destinationModalElement || !modalTitle || !modalBody) return;
      modalTitle.textContent = button.dataset.title || "Destination details";
      modalBody.textContent = button.dataset.description || "";
      bootstrap.Modal.getOrCreateInstance(destinationModalElement).show();
    });
  });

  // Gallery modal and previous/next controls
  const galleryPhotos = document.querySelectorAll(".gallery-photo");
  const galleryModalElement = document.getElementById("galleryModal");
  const largeGalleryImage = document.getElementById("largeGalleryImage");
  const galleryCaption = document.getElementById("galleryCaption");
  const galleryModalTitle = document.getElementById("galleryModalTitle");
  const photoNumber = document.getElementById("photoNumber");
  const previousPhoto = document.getElementById("previousPhoto");
  const nextPhoto = document.getElementById("nextPhoto");
  const galleryImages = Array.from(galleryPhotos).map(function (photo) {
    return { image: photo.dataset.image, caption: photo.dataset.caption };
  });
  let currentPhotoIndex = 0;

  function showGalleryPhoto(index) {
    if (!galleryImages.length || !largeGalleryImage) return;
    currentPhotoIndex = (index + galleryImages.length) % galleryImages.length;
    const photo = galleryImages[currentPhotoIndex];
    largeGalleryImage.src = photo.image;
    largeGalleryImage.alt = photo.caption;
    if (galleryCaption) galleryCaption.textContent = photo.caption;
    if (galleryModalTitle) galleryModalTitle.textContent = photo.caption;
    if (photoNumber) photoNumber.textContent = "Photo " + (currentPhotoIndex + 1) + " of " + galleryImages.length;
  }

  galleryPhotos.forEach(function (photo, index) {
    photo.addEventListener("click", function () {
      if (!galleryModalElement) return;
      showGalleryPhoto(index);
      bootstrap.Modal.getOrCreateInstance(galleryModalElement).show();
    });
  });
  if (previousPhoto) previousPhoto.addEventListener("click", function () { showGalleryPhoto(currentPhotoIndex - 1); });
  if (nextPhoto) nextPhoto.addEventListener("click", function () { showGalleryPhoto(currentPhotoIndex + 1); });

  // Set the earliest booking date to today
  const travelDateInput = document.getElementById("travelDate");
  if (travelDateInput) {
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    travelDateInput.min = localToday;
  }

  // Add custom validation messages to the contact form
  const contactForm = document.getElementById("contactForm");
  const contactAlert = document.getElementById("contactAlert");

  function showFormValidation(form) {
    let valid = true;
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      if (!field.checkValidity()) {
        field.classList.add("is-invalid");
        field.classList.remove("is-valid");
        valid = false;
      } else {
        field.classList.remove("is-invalid");
        if (field.value.trim() !== "") field.classList.add("is-valid");
      }
    });
    return valid;
  }

  function addLiveValidation(form) {
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.checkValidity()) {
          field.classList.remove("is-invalid");
          if (field.value.trim() !== "") field.classList.add("is-valid");
        } else {
          field.classList.add("is-invalid");
          field.classList.remove("is-valid");
        }
      });
      field.addEventListener("change", function () {
        if (field.checkValidity()) {
          field.classList.remove("is-invalid");
          if (field.value.trim() !== "") field.classList.add("is-valid");
        }
      });
    });
  }

  if (contactForm) {
    addLiveValidation(contactForm);
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!showFormValidation(contactForm)) {
        contactForm.querySelector(":invalid")?.focus();
        if (contactAlert) contactAlert.hidden = true;
        return;
      }
      if (contactAlert) {
        contactAlert.hidden = false;
        contactAlert.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      contactForm.reset();
      contactForm.querySelectorAll(".is-valid, .is-invalid").forEach(function (field) {
        field.classList.remove("is-valid", "is-invalid");
      });
    });
    contactForm.addEventListener("reset", function () {
      if (contactAlert) contactAlert.hidden = true;
      setTimeout(function () {
        contactForm.querySelectorAll(".is-valid, .is-invalid").forEach(function (field) {
          field.classList.remove("is-valid", "is-invalid");
        });
      }, 0);
    });
  }

  // Booking calculator
  const bookingForm = document.getElementById("bookingForm");
  const activitySelect = document.getElementById("activity");
  const visitorCount = document.getElementById("visitorCount");
  const tripDays = document.getElementById("tripDays");
  const accommodationSelect = document.getElementById("accommodation");
  const estimatedCost = document.getElementById("estimatedCost");
  const calculateButton = document.getElementById("calculateButton");
  const bookingAlert = document.getElementById("bookingAlert");

  function calculateTripCost() {
    if (!activitySelect || !visitorCount || !tripDays || !accommodationSelect || !estimatedCost) return 0;
    const activityPrice = Number(activitySelect.selectedOptions[0]?.dataset.price || 0);
    const roomPrice = Number(accommodationSelect.selectedOptions[0]?.dataset.price || 0);
    const people = Number(visitorCount.value) || 0;
    const days = Number(tripDays.value) || 0;
    const total = (activityPrice * people * days) + (roomPrice * days);
    estimatedCost.textContent = "Estimated total: LSL " + total.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return total;
  }

  if (bookingForm) {
    addLiveValidation(bookingForm);
    [activitySelect, visitorCount, tripDays, accommodationSelect].forEach(function (field) {
      if (field) field.addEventListener(field.tagName === "INPUT" ? "input" : "change", calculateTripCost);
    });

    if (calculateButton) {
      calculateButton.addEventListener("click", function () {
        if (!showFormValidation(bookingForm)) {
          bookingForm.querySelector(":invalid")?.focus();
          return;
        }
        calculateTripCost();
      });
    }

    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!showFormValidation(bookingForm)) {
        bookingForm.querySelector(":invalid")?.focus();
        if (bookingAlert) bookingAlert.hidden = true;
        return;
      }
      calculateTripCost();
      if (bookingAlert) {
        bookingAlert.hidden = false;
        bookingAlert.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    bookingForm.addEventListener("reset", function () {
      if (bookingAlert) bookingAlert.hidden = true;
      setTimeout(function () {
        bookingForm.querySelectorAll(".is-valid, .is-invalid").forEach(function (field) {
          field.classList.remove("is-valid", "is-invalid");
        });
        calculateTripCost();
      }, 0);
    });
    calculateTripCost();
  }
});
