import styles from './ErrorDialog.module.css'
import {Button, Dialog} from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {ErrorMessage} from "../../model";

function ErrorDialog({message, open, onClose}: {message?: ErrorMessage, open: boolean, onClose: () => void}) {
  return (
    <Dialog onClose={() => onClose()} open={open} maxWidth="lg">
      <h2 className={styles.errorTitle}>
        <span className={styles.errorTitleIcon}><ErrorOutlineIcon/></span>
        <span className={styles.errorTitleText}>Error</span>
      </h2>
      <div className={styles.message}>{message?.message}</div>
      <div>{message?.details}</div>
      <pre className={styles.errorDetails}>{message?.err?.stack}</pre>
      <div className={styles.actions}>
        <Button onClick={() => onClose()} variant='contained'>Close</Button>
      </div>
    </Dialog>
  );
}

export default ErrorDialog;