import chromep from "chrome-promise";
import {sleep} from "./utils";
import {Registration} from "./types";

const submit = (registration: Registration): void => {
  // Name
  (document.querySelector("#register input:nth-child(5)") as HTMLInputElement).value = registration.name;
  // Email
  (document.querySelector("#register input:nth-child(6)") as HTMLInputElement).value = registration.email;
  // Cellphone
  (document.querySelector("#register input:nth-child(7)") as HTMLInputElement).value = registration.tel;
  // Location
  (document.getElementById(registration.location) as HTMLInputElement).checked = true;
  // Agree to terms
  (document.getElementById("agree") as HTMLInputElement).checked = true;
  // Click Continue
  (document.querySelector("#register input[name=commit]") as HTMLInputElement).click();
};

(async (): Promise<void> => {
  const url = new URL(document.location.href);
  const id = url.searchParams.get("id");
  if (!id) {
    return;
  }

  if (document.getElementById("register")) {
    const store: {registrations?: Registration[]} = await chromep.storage.local.get();
    store.registrations?.filter((value) => id === value.id).forEach(submit);
  } else {
    await sleep(1000);
    document.location.reload();
  }
})();
