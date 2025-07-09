import Alert from "@mui/material/Alert"

export function ErrorAlert({message, onClose}) {
 return (
  <Alert className="flex flex-col items-center text-center gap-2 text-red-500 p-1" severity="error" onClose={onClose}>
   {message}
  </Alert>
 )
}

export function SuccessAlert({message, onClose}) {
 return (
  <Alert className="flex flex-col items-center text-center gap-2 text-red-500 p-1" severity="success" onClose={onClose}>
   {message}
  </Alert>
 )
}
