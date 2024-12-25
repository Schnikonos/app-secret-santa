import styles from './ErrorDialog.module.css'
import {Button, Dialog, DialogTitle} from "@mui/material";
import {ErrorMessage} from "../../model";

function ErrorDialog({message, open, onClose}: {message?: ErrorMessage, open: boolean, onClose: () => void}) {
  return (
    <Dialog onClose={() => onClose()} open={open}>
      <DialogTitle>Confirmation</DialogTitle>
      <div className={styles.message}>{message?.message}</div>
      <div className={styles.actions}>
        <Button onClick={() => onClose()} variant='contained'>Close</Button>
      </div>
    </Dialog>
  );
}

export default ErrorDialog;