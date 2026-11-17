let form = document.querySelector("#searchForm");
let input = document.querySelector("#searchInput");
let type = document.querySelector("#jobType");
let jobLocation = document.querySelector("#location");
let results = document.querySelector("#jobResults");
let savedJobsContainer = document.querySelector("#savedJobs");
let backToTopButton = document.getElementById("backToTop");
let savedJobs = JSON.parse(localStorage.getItem("savedJobs")) || [];

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  console.log("Search started");
  if (!input.value.trim()) {
    results.textContent = "Please fill in all required field.";
    return;
  } else {
    results.textContent = "Loading...";
    try {
      const response = await fetch(
        "https://www.arbeitnow.com/api/job-board-api",
      );
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();
      let jobs = data.data;
      const searchTerm = input.value.trim().toLowerCase();
      const selectedType = type.value.toLowerCase();
      const selectedLocation = jobLocation.value.toLowerCase();
      const filteredJobs = jobs.filter(function (job) {
        const title = (job.title || "").toLowerCase();
        const description = (job.description || "").toLowerCase();
        const tags = Array.isArray(job.tags)
        ? job.tags.join("").toLowerCase() : "";
        const searchText = input.value.trim().toLowerCase();
        const selectedType = type.value.toLowerCase();
        const selectedLocation = jobLocation.value.toLowerCase();
        const matchesSearch = !searchText || title.includes(searchText) || description.includes(searchText) || tags.includes(searchText);
        const jobText = `${title} ${description} ${tags}`;
        const matchesType = !selectedType || jobText.includes(selectedType);
        const isRemote = job.remote === true;
        const matchesLocation = !selectedLocation || (selectedLocation === "remote" && isRemote) || (selectedLocation === "on-site" && !isRemote);
        return matchesSearch && matchesType && matchesLocation;
      });
      results.innerHTML = "";
      if (filteredJobs.length === 0) {
        results.textContent = "No jobs found. Try another search.";
        return;
      }
      filteredJobs.forEach(function (job) {
        const card = document.createElement("div");
        card.classList.add("job-card");
        card.innerHTML = `Job Title : <h3>${job.title}</h3>
        <p>Company: ${job.company_name}</p>
        <p>Job Location: ${job.location}</p>
        <p>Job Type: ${job.remote ? "Remote" : "On-site"}</p>
        <a href="${job.url}" target="_blank">View Job</a>
        <button class="save-btn">Save Job</button>`;
        let saveButton = card.querySelector(".save-btn");
        saveButton.addEventListener("click", function () {
          const alreadySaved = savedJobs.some(function (item) {
            return item.url === job.url;
          });
          if (alreadySaved) {
            return;
          }
          const savedJob = {
            title: job.title,
            company_name: job.company_name,
            location: job.location,
            remote: job.remote,
            url: job.url,
          };
          savedJobs.push(savedJob);
          localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
          displaySavedJobs();
          console.log("Saved:", job.title);
          alert(
            `Job "${job.title}" has been saved. You can view it in the "Saved Jobs" section.`,
          );
        });
        results.appendChild(card);
      });
    } catch (error) {
      results.textContent = "Something went wrong.";
    }
  }
});
function displaySavedJobs() {
  savedJobsContainer.innerHTML = "";

  savedJobs.forEach(function (job) {
    const card = document.createElement("div");
    card.classList.add("saved-job-card");
    card.innerHTML = `<h3>Job Title: ${job.title}</h3>
        <p>Company:  ${job.company_name}</p>
        <p>Location: ${job.location}</p>
        <p>Job Type: ${job.remote ? "Remote" : "On-site"}</p>
        <a href="${job.url}" target="_blank">View Job</a>
        <button class="remove-saved">Remove</button>`;
    savedJobsContainer.appendChild(card);
    const removeButton = card.querySelector(".remove-saved");
    removeButton.addEventListener("click", function () {
      savedJobs = savedJobs.filter(function (item) {
        return item.url !== job.url;
      });
      localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
      displaySavedJobs();
    });
    savedJobsContainer.appendChild(card);
  });
}
window.addEventListener("scroll", function () {
  backToTopButton.style.display = window.scrollY > 300 ? "block" : "none";
});
backToTopButton.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
displaySavedJobs();

