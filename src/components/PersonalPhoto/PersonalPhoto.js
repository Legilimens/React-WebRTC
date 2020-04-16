import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Slide from '@material-ui/core/Slide';
import CloseIcon from '@material-ui/icons/Close';
import SaveIcon from '@material-ui/icons/Save';
import clsx from 'clsx';
import Spinner from '../Spinner';
import { useWebRTC } from '../../hooks/webRTC.hook';
import useStyles from './styles';

const initButtonVisible = {
  openWebCam: true, takePhoto: false, startRec: true, stopRec: false, downloadRec: false, downloadPhoto: false,
};
const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

function PersonalPhoto(props) {
  const { open, handleClose, handleAddByWebRTC } = props;
  const {
    isLoading, isError,
    startVideoRec, stopVideoRec, downloadVideoRec, getVideoByBlob,
    openWebCam, takePhoto, downloadPhoto, getPhotoByBlob,
  } = useWebRTC();
  const recordingPlayer = React.useRef();
  const playableMedia = React.useRef();
  const takenPhoto = React.useRef();
  const [buttonVisible, setButtonVisible] = React.useState(initButtonVisible);
  const classes = useStyles();

  const handleOnClose = () => {
    setButtonVisible(initButtonVisible);
    handleClose();
  };

  const handleOpenWebCam = () => {
    setButtonVisible({
      openWebCam: false, takePhoto: true, startRec: false, stopRec: false, downloadRec: false, downloadPhoto: false,
    });
    openWebCam(recordingPlayer.current);
  };

  const handleTakePhoto = () => {
    setButtonVisible({
      openWebCam: true, takePhoto: false, startRec: true, stopRec: false, downloadRec: false, downloadPhoto: true,
    });
    takePhoto(recordingPlayer.current, takenPhoto.current);
  };

  const handleStartRec = () => {
    setButtonVisible({
      openWebCam: false, takePhoto: false, startRec: false, stopRec: true, downloadRec: false, downloadPhoto: false,
    });
    startVideoRec(recordingPlayer.current);
  };

  const handleStopRec = () => {
    setButtonVisible({
      openWebCam: true, takePhoto: false, startRec: true, stopRec: false, downloadRec: true, downloadPhoto: false,
    });
    stopVideoRec(playableMedia.current);
  };

  const handleVideoDownload = () => {
    downloadVideoRec(playableMedia.current);
  };

  const handlePhotoDownload = () => {
    downloadPhoto(takenPhoto.current);
  };

  const handleSave = () => {
    // мы должны посмотреть, какое действие делал клиент
    // если делал фото - получаем из хука webRTC фото в виде blob и передаем его
    // если снимал видео - получаем видео в blob и передаем
    // посмотреть что за действие совершал клиент мы можем опираясь на кнопки которые отображаются на странице
    if (buttonVisible.downloadRec) {
      // если отображается кнопка скачивания видео - получаем blob видеофайла
      const blobData = getVideoByBlob();
      const blobAsFile = new File([blobData], `WebRTC_${new Date().toLocaleString()}.webm`);
      handleAddByWebRTC(blobAsFile);
      handleOnClose();
    } else if (buttonVisible.downloadPhoto) {
      // если отображается кнопка скачивания фото - получаем blob фотографии (функция асинхронная)
      getPhotoByBlob(takenPhoto.current).then((blobData) => {
        const blobAsFile = new File([blobData], `WebRTC_${new Date().toLocaleString()}.png`);
        handleAddByWebRTC(blobAsFile);
        handleOnClose();
      });
    } else {
      // иначе клиент пытается сохранить файл не сфотографировав и не сняв никакое видео
      // просто закроем окно
      handleOnClose();
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={handleOnClose} TransitionComponent={Transition}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleOnClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Фото/видео с камеры Вашего устройства
          </Typography>
          {(buttonVisible.downloadRec || buttonVisible.downloadPhoto) && (
            <Button autoFocus color="inherit" onClick={handleSave}>
              Сохранить
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Grid container direction="row" justify="center" className={classes.containerRoot}>
        <Grid item xs={12} md={8} lg={6}>
          {isError && <Typography variant="h6">Подключение к камере Вашего устройства недоступно</Typography>}
          {isLoading && <Spinner />}
          <div className={isLoading || isError ? classes.hidden : null}>
            <Grid container direction="row" justify="center" alignItems="center" className={classes.item}>
              <Grid item xs={12}>
                {buttonVisible.openWebCam && (
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={handleOpenWebCam}
                  >
                    Сделать фото
                  </Button>
                )}
                {buttonVisible.takePhoto && (
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={handleTakePhoto}
                  >
                    Сфотографировать
                  </Button>
                )}
                {buttonVisible.startRec && (
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={handleStartRec}
                  >
                    Начать запись видео
                  </Button>
                )}
                {buttonVisible.stopRec && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleStopRec}
                  >
                    Остановить
                  </Button>
                )}
                {buttonVisible.downloadRec && (
                  <Button
                    variant="outlined"
                    color="primary"
                    className={classes.button}
                    startIcon={<SaveIcon />}
                    onClick={handleVideoDownload}
                  >
                    Скачать видеозапись
                  </Button>
                )}
                {buttonVisible.downloadPhoto && (
                  <Button
                    variant="outlined"
                    color="primary"
                    className={classes.button}
                    startIcon={<SaveIcon />}
                    onClick={handlePhotoDownload}
                  >
                    Скачать фото
                  </Button>
                )}
              </Grid>
            </Grid>
            <Grid container direction="row" justify="center" alignItems="center">
              <Grid item xs={12}>
                <video
                  className={clsx(
                    classes.player,
                    buttonVisible.stopRec || buttonVisible.takePhoto ? null : classes.hidden,
                  )}
                  ref={recordingPlayer}
                >
                  <track default kind="captions" srcLang="ru" src="" />
                  Извините, Ваш браузер не поддерживает работу с видео
                </video>
                <video
                  className={clsx(
                    classes.player,
                    buttonVisible.downloadRec ? null : classes.hidden,
                  )}
                  ref={playableMedia}
                  controls
                >
                  <track default kind="captions" srcLang="ru" src="" />
                  Извините, Ваш браузер не поддерживает работу с видео
                </video>
                <canvas
                  className={clsx(
                    classes.imgCanvas,
                    buttonVisible.downloadPhoto ? null : classes.hidden,
                  )}
                  ref={takenPhoto}
                />
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    </Dialog>
  );
}

export default PersonalPhoto;
