import styles from './ConfirmModal.module.css'
import {Button, Dialog, DialogTitle} from "@mui/material";

function ConfirmModal({message, open, onClose}: {message: string, open: boolean, onClose: (res: boolean) => void}) {
  return (
    <Dialog onClose={() => onClose(false)} open={open}>
      <DialogTitle>Confirmation</DialogTitle>
      <div className={styles.message}>{message}</div>
      <div className={styles.actions}>
        <Button onClick={() => onClose(false)} variant='outlined'>Cancel</Button>
        <Button onClick={() => onClose(true)} variant='contained'>Confirm</Button>
      </div>
    </Dialog>
  );
}

export default ConfirmModal;