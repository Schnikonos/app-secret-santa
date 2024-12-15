import React, {useEffect, useState} from "react";
import styles from './MailTemplate.module.css'
import {MailTemplate} from "../../model";
import {get} from "../../Utils";

function MailTemplate() {
  const [mailTemplates, setMailTemplates] = useState<MailTemplate[]>([]);

  useEffect(() => {
    get('http://localhost:8080/email/template').then(res => setMailTemplates(res));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.templateSettings}>

      </div>
    </div>
  );
}

export default MailTemplate;