document.addEventListener("DOMContentLoaded", () => {
  const cloneTemplate = (id) =>
    document.getElementById(id).content.firstElementChild.cloneNode(true);

  const safeUrl = (value) => {
    const url = value.trim();
    if (!url) return "#";
    try {
      const parsed = new URL(url, window.location.href);
      return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)
        ? parsed.href
        : "#";
    } catch {
      return "#";
    }
  };

  const colorToHex = (colour) => {
    const context = document.createElement("canvas").getContext("2d");
    context.fillStyle = "#b8d8ff";
    context.fillStyle = colour || "#b8d8ff";
    const normalized = context.fillStyle;
    if (normalized.startsWith("#")) return normalized;
    const match = normalized.match(/\d+/g);
    return match
      ? `#${match
          .slice(0, 3)
          .map((part) => Number(part).toString(16).padStart(2, "0"))
          .join("")}`
      : "#b8d8ff";
  };

  const addSkill = (container, name = "New skill", colour = "#b8d8ff") => {
    const skill = cloneTemplate("skillTemplate");
    skill.querySelector('input[type="text"]').value = name;
    skill.querySelector('input[type="color"]').value = colorToHex(colour);
    skill.style.setProperty("--color", colour);
    container.append(skill);
    return skill;
  };

  const addListItem = (container, value = "New item") => {
    const item = cloneTemplate("listItemTemplate");
    item.querySelector("input").value = value;
    container.append(item);
    return item;
  };

  const addLink = (containerId, name = "Link name", url = "") => {
    const container = document.getElementById(containerId);
    if (!container) return null;
    const link = cloneTemplate("linkTemplate");
    link.querySelector('[data-bind="link-text"]').value = name;
    link.querySelector('[data-bind="link-url"]').value = url;
    link.querySelector(".linkPreview").textContent = name;
    link.querySelector(".linkPreview").href = safeUrl(url);
    container.append(link);
    return link;
  };

  const addInfoBox = (title = "Skills", content = null) => {
    const box = cloneTemplate("infoBoxTemplate");
    box.querySelector(".boxTitle").value = title;
    document.getElementById("aboutMeContainer").append(box);
    const type = content?.type === "list" ? "list" : "skills";
    const items = box.querySelector(".boxItems");
    box.querySelector("select").value = type;
    if (type === "list") {
      items.classList.add("listItems");
      box.querySelector('[data-action="add-box-item"]').textContent =
        "+ Add item";
      (content?.contents || ["New item"]).forEach((item) =>
        addListItem(items, item),
      );
    } else {
      items.classList.add("skillsDiv");
      Object.entries(content?.contents || { "New skill": "#b8d8ff" }).forEach(
        ([name, colour]) => addSkill(items, name, colour),
      );
    }
    return box;
  };

  const addProject = (name = "Project name", content = null) => {
    const project = cloneTemplate("projectTemplate");
    project.querySelector("h3 input").value = name;
    project.querySelector(".projectUrl").value = content?.url || "";
    project.querySelector(".projectLink").href = safeUrl(content?.url || "");
    project.querySelector("textarea").value = content?.subtitle || "";
    const skills = content?.skills || { "New skill": "#b8d8ff" };
    Object.entries(skills).forEach(([skill, colour]) =>
      addSkill(project.querySelector(".skillBox"), skill, colour),
    );
    document.getElementById("projectsDiv").append(project);
    return project;
  };

  const collectLinks = (containerId) => {
    const links = {};
    document
      .querySelectorAll(`#${containerId} .editableLink`)
      .forEach((link) => {
        const name = link.querySelector('[data-bind="link-text"]').value.trim();
        const url = link.querySelector('[data-bind="link-url"]').value.trim();
        if (name && url) links[name] = url;
      });
    return links;
  };

  const collectSkills = (container) => {
    const skills = {};
    container.querySelectorAll(":scope > .editableSkill").forEach((skill) => {
      const name = skill.querySelector('input[type="text"]').value.trim();
      const colour = skill.querySelector('input[type="color"]').value;
      if (name) skills[name] = colour;
    });
    return skills;
  };

  const loadJson = (data) => {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("The JSON file must contain a student object.");
    }

    document.getElementById("photoUrl").value = data.photoUrl || "";
    document.getElementById("studentName").value = data.name || "";
    document.getElementById("graduated").checked = Boolean(data.isGrad);
    document.getElementById("graduationYear").value = data.gradYear
      ? String(data.gradYear).slice(-2)
      : "";
    document.getElementById("pField").value = data.aboutMeText || "";
    document.getElementById("projectsText").value = data.projectsText || "";
    document.getElementById("contactMeText").value = data.contactMeText || "";

    document.getElementById("socialLinks").replaceChildren();
    Object.entries(data.links || {}).forEach(([name, url]) =>
      addLink("socialLinks", name, url),
    );

    document.getElementById("aboutMeContainer").replaceChildren();
    Object.entries(data.aboutMeContainers || {}).forEach(([title, content]) =>
      addInfoBox(title, content),
    );

    document.getElementById("projectsDiv").replaceChildren();
    Object.entries(data.projectsContainers || {}).forEach(([name, content]) =>
      addProject(name, content),
    );

    document.getElementById("contactLinks").replaceChildren();
    Object.entries(data.contact || {}).forEach(([name, url]) =>
      addLink("contactLinks", name, url),
    );

    document.getElementById("photoUrl").dispatchEvent(new Event("input"));
    document.getElementById("graduated").dispatchEvent(new Event("change"));
  };

  const exportJson = () => {
    const aboutMeContainers = {};
    document.querySelectorAll("#aboutMeContainer > .infoBox").forEach((box) => {
      const title = box.querySelector(".boxTitle").value.trim();
      const type = box.querySelector("select").value;
      if (!title) return;

      const contents =
        type === "list"
          ? [...box.querySelectorAll(".listItem input")]
              .map((input) => input.value.trim())
              .filter(Boolean)
          : collectSkills(box.querySelector(".boxItems"));
      aboutMeContainers[title] = { type, contents };
    });

    const projectsContainers = {};
    document
      .querySelectorAll("#projectsDiv > .projectBox")
      .forEach((project) => {
        const name = project.querySelector("h3 input").value.trim();
        if (!name) return;
        projectsContainers[name] = {
          url: project.querySelector(".projectUrl").value.trim(),
          subtitle: project.querySelector("textarea").value.trim(),
          skills: collectSkills(project.querySelector(".skillBox")),
        };
      });

    const yearSuffix = document.getElementById("graduationYear").value.trim();
    const data = {
      photoUrl: document.getElementById("photoUrl").value.trim(),
      name: document.getElementById("studentName").value.trim(),
      isGrad: document.getElementById("graduated").checked,
      gradYear: Number(`20${yearSuffix}`),
      links: collectLinks("socialLinks"),
      aboutMeText: document.getElementById("pField").value.trim(),
      aboutMeContainers,
      projectsText: document.getElementById("projectsText").value.trim(),
      projectsContainers,
      contactMeText: document.getElementById("contactMeText").value.trim(),
      contact: collectLinks("contactLinks"),
    };

    const json = JSON.stringify(data, null, 2);
    const blobUrl = URL.createObjectURL(
      new Blob([`${json}\n`], { type: "application/json" }),
    );
    const download = document.createElement("a");
    const filename =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "student";
    download.href = blobUrl;
    download.download = `${filename}.json`;
    download.click();
    URL.revokeObjectURL(blobUrl);
  };

  document.getElementById("graduated").addEventListener("change", (event) => {
    document.getElementById("graduationLabel").textContent = event.currentTarget
      .checked
      ? "Graduated "
      : "Expected Grad ";
  });

  document.getElementById("photoUrl").addEventListener("input", (event) => {
    const image = document.getElementById("profilePhoto");
    const placeholder = document.getElementById("photoPlaceholder");
    const url = safeUrl(event.currentTarget.value);
    image.hidden = url === "#";
    placeholder.hidden = url !== "#";
    if (url !== "#") image.src = url;
  });

  document.getElementById("profilePhoto").addEventListener("error", (event) => {
    event.currentTarget.hidden = true;
    document.getElementById("photoPlaceholder").hidden = false;
  });

  document
    .getElementById("jsonFileInput")
    .addEventListener("change", async (event) => {
      const file = event.currentTarget.files[0];
      if (!file) return;
      const status = document.getElementById("fileStatus");
      try {
        loadJson(JSON.parse(await file.text()));
        status.textContent = `Loaded ${file.name}`;
      } catch (error) {
        status.textContent = `Could not load ${file.name}: ${error.message}`;
      } finally {
        event.currentTarget.value = "";
      }
    });

  document.addEventListener("input", (event) => {
    const input = event.target;
    if (input.matches('[data-bind="link-text"]')) {
      input.closest(".editableLink").querySelector(".linkPreview").textContent =
        input.value || "Link name";
    } else if (input.matches('[data-bind="link-url"]')) {
      input.closest(".editableLink").querySelector(".linkPreview").href =
        safeUrl(input.value);
    } else if (input.matches('[data-bind="skill-color"]')) {
      input.closest(".skill").style.setProperty("--color", input.value);
    } else if (input.matches('[data-bind="project-url"]')) {
      input.closest(".projectBox").querySelector(".projectLink").href = safeUrl(
        input.value,
      );
    }
  });

  document.addEventListener("change", (event) => {
    if (!event.target.matches('[data-action="change-box-type"]')) return;
    const box = event.target.closest(".infoBox");
    const items = box.querySelector(".boxItems");
    const isList = event.target.value === "list";
    items.replaceChildren();
    items.classList.toggle("skillsDiv", !isList);
    items.classList.toggle("listItems", isList);
    box.querySelector('[data-action="add-box-item"]').textContent = isList
      ? "+ Add item"
      : "+ Add skill";
    isList ? addListItem(items) : addSkill(items);
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    if (action === "remove") {
      button.closest(".editorGroup").remove();
    } else if (action === "add-link") {
      addLink(button.dataset.target);
    } else if (action === "add-info-box") {
      addInfoBox();
    } else if (action === "add-box-item") {
      const box = button.closest(".infoBox");
      const items = box.querySelector(".boxItems");
      box.querySelector("select").value === "list"
        ? addListItem(items)
        : addSkill(items);
    } else if (action === "add-project") {
      addProject();
    } else if (action === "add-project-skill") {
      addSkill(button.closest(".projectBox").querySelector(".skillBox"));
    } else if (action === "export-json") {
      exportJson();
    }
  });

  addLink("socialLinks");
  addInfoBox();
  addProject();
  addLink("contactLinks");
});
