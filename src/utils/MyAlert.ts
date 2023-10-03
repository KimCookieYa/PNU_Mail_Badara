import Swal from "sweetalert2";

export function mySuccessAlert(text: string) {
  Swal.fire({
    title: import.meta.env.VITE_APP_TITLE_EN,
    text: text,
    icon: "success",
    showCancelButton: false,
    confirmButtonText: "Ok",
  });
}

export function myErrorAlert(text: string) {
  Swal.fire({
    title: import.meta.env.VITE_APP_TITLE_EN,
    text: text,
    icon: "error",
    showCancelButton: false,
    confirmButtonText: "Ok",
  });
}

export function myWarningAlert(text: string) {
  Swal.fire({
    title: import.meta.env.VITE_APP_TITLE_EN,
    text: text,
    icon: "warning",
    showCancelButton: false,
    confirmButtonText: "Ok",
  });
}
