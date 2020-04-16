import React from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import PersonalPhoto from '../PersonalPhoto';
import useStyles from './styles';

function Form() {
  const [personalPhotoOpen, setPersonalPhotoOpen] = React.useState(false);
  const classes = useStyles();

  const handleAddByWebRTC = (webRTCFile) => {
    const fileInfo = webRTCFile;
    if (fileInfo === undefined) return;
    console.log(webRTCFile);
  }

  const handlePersonalPhotoOpen = () => {
    setPersonalPhotoOpen(true);
  }

  const handlePersonalPhotoClose = () => {
    setPersonalPhotoOpen(false);
  }

  return (
    <Grid container justify="center" alignItems="center">
      <Grid item xs={12} md={8} lg={6}>
        <Grid container direction="row" justify="center" alignItems="center" className={classes.containerRoot}>
          <Grid item xs={1} md={2} lg={1}>
            <Tooltip title="Сделать фото/видео с камеры Вашего устройства" placement="top">
              <Button
                variant="contained"
                className={classes.photoBtn}
                onClick={handlePersonalPhotoOpen}
              >
                <AddAPhotoIcon />
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs={11} md={10} lg={11}>
            <form noValidate autoComplete="off">
              <TextField
                label="Фото/видео"
                margin="normal"
                variant="outlined"
                disabled
                fullWidth
              />
            </form>
            <PersonalPhoto open={personalPhotoOpen} handleClose={handlePersonalPhotoClose} handleAddByWebRTC={handleAddByWebRTC} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Form;
