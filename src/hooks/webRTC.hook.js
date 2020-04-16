/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
import React from 'react';

/**
 * Пользовательский React Hook для работы с webRTC
 * @version 1.0
 * @return {boolean} isLoading - индикатор загрузки
 * @return {boolean} isError - индикатор наличия ошибки
 * @return {Function} startVideoRec - старт записи видео
 * @return {Function} stopVideoRec - стоп записи
 * @return {Function} downloadVideoRec - скачать записанное видео
 * @return {Function} getVideoByBlob - получить видео в blob
 * @return {Function} openWebCam - инициализировать камеру (используется для фото)
 * @return {Function} takePhoto - сделать фото при инициализированной камере
 * @return {Function} downloadPhoto - скачать фото
 * @return {Function} getPhotoByBlob - получить фото в blob
 */
export function useWebRTC() {
  const [stream, setStream] = React.useState(null);
  const [recorder, setRecorder] = React.useState(null);
  const [recordedChunks, setRecordedChunks] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  /**
   * Инициализация настроек камеры
   */
  const constraints = {
    audio: true,
    video: {
      facingMode: 'user',
      width: { min: 640, ideal: 1280, max: 1920 },
      height: { min: 480, ideal: 720, max: 1080 },
    },
  };

  /**
   * инициализируем userMedia
   * @param {Object} options - настройки камеры
   * @param {Function} successCallback - коллбек при успехе
   * @param {Function} failureCallback - коллбек при неудаче
   */
  const getUserMedia = (options, successCallback, failureCallback) => {
    const api = navigator.getUserMedia || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (api) {
      return api.bind(navigator)(options, successCallback, failureCallback);
    }
    return null;
  };

  /**
   * Функция записи чанка в итоговый массив чанков видеофайла
   * @param {Object} event
   */
  const recorderOnDataAvailable = (event) => {
    if (event.data.size === 0) return;
    setRecordedChunks((prev) => [...prev, event.data]);
  };

  /**
   * Старт записи с видеокамеры
   * @param {React.Ref} videoPlayer Ref на видеоплеер, куда будет проигрываться поток
   */
  const startVideoRec = (videoPlayer) => {
    setIsLoading(true);
    if (
      !navigator.getUserMedia && !navigator.webkitGetUserMedia
      && !navigator.mozGetUserMedia && !navigator.msGetUserMedia
    ) {
      // eslint-disable-next-line no-alert
      alert('Ваш браузер не поддерживает работу камерой!');
      setIsLoading(false);
      setIsError(true);
      return;
    }

    // если в массиве записанных чанков не пусто - стрираем старое значение
    if (recordedChunks.length) {
      setRecordedChunks([]);
    }

    getUserMedia(constraints, (streamData) => {
      videoPlayer.onloadedmetadata = () => {
        videoPlayer.play();
      };
      if ('srcObject' in videoPlayer) {
        videoPlayer.srcObject = streamData;
      } else if (navigator.mozGetUserMedia) {
        videoPlayer.mozSrcObject = streamData;
      } else {
        videoPlayer.src = (window.URL || window.webkitURL).createObjectURL(streamData);
      }
      setStream(streamData);
      let recorderData;
      try {
        recorderData = new MediaRecorder(streamData, { mimeType: 'video/webm' });
      } catch (e) {
        throw new Error(`Ошибка при создании медиапотока: ${e}`);
      }
      setRecorder(recorderData);
      recorderData.ondataavailable = recorderOnDataAvailable;
      recorderData.start(100);
      setIsLoading(false);
    }, (err) => {
      setIsLoading(false);
      // eslint-disable-next-line no-alert
      alert(`Произошла ошибка: ${err}`);
      setIsError(true);
      return null;
    });
  };

  /**
   * Стоп записи с видеокамеры
   * @param {React.Ref} videoPlayer Ref на видеоплеер, куда будет проигрываться ЗАПИСАННЫЙ поток
   * Плеер который ведет запись и плеер который проигрывает результат НЕ ДОЛЖНЫ СОВПАДАТЬ!
   */
  const stopVideoRec = (videoPlayer) => {
    if (!recorder) {
      return;
    }
    recorder.stop();
    stream.getTracks()[0].stop();

    // перед тем как записать новое значение - очистим старое
    videoPlayer.removeAttribute('src');
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = (window.URL || window.webkitURL).createObjectURL(blob);
    videoPlayer.src = url;
  };

  /**
   * Функция скачивания видеофайла в формате webm
   */
  const downloadVideoRec = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = (window.URL || window.webkitURL).createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = `WebRTC_${new Date().toLocaleString()}.webm`;
    a.click();

    // setTimeout() нужен для Firefox
    setTimeout(() => {
      (window.URL || window.webkitURL).revokeObjectURL(url);
    }, 100);
  };

  /**
   * Получить видеофайл в blob
   */
  const getVideoByBlob = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    return blob;
  };

  /**
   * Открыть камеру для дальнейшего фото
   * @param {React.Ref} videoPlayer Ref на видеоплеер, куда будет проигрываться поток
   */
  const openWebCam = (videoPlayer) => {
    setIsLoading(true);
    if (
      !navigator.getUserMedia && !navigator.webkitGetUserMedia
      && !navigator.mozGetUserMedia && !navigator.msGetUserMedia
    ) {
      // eslint-disable-next-line no-alert
      alert('Ваш браузер не поддерживает работу камерой!');
      setIsLoading(false);
      setIsError(true);
      return;
    }

    getUserMedia(constraints, (streamData) => {
      videoPlayer.onloadedmetadata = () => {
        videoPlayer.play();
      };
      if ('srcObject' in videoPlayer) {
        videoPlayer.srcObject = streamData;
      } else if (navigator.mozGetUserMedia) {
        videoPlayer.mozSrcObject = streamData;
      } else {
        videoPlayer.src = (window.URL || window.webkitURL).createObjectURL(streamData);
      }
      setIsLoading(false);
    }, (err) => {
      setIsLoading(false);
      // eslint-disable-next-line no-alert
      alert(`Произошла ошибка: ${err}`);
      setIsError(true);
      return null;
    });
  };

  /**
   * Функция преобразовывает canvas в blob
   * @param {React.Ref} canvas Ref на canvas, где отображается фото
   * @param {String} mime mime-type итоговой картинки
   * @param {Number} quality качечтво итоговой картинки
   */
  const getPhotoByBlob = async (canvas, mime = 'image/jpeg', quality = 1) => new Promise((resolve) => {
    canvas.toBlob(resolve, mime, quality);
  });

  /**
   * Сделать фото
   * @param {React.Ref} canvasRef Ref на canvas, где будет отображаться фото
   */
  const takePhoto = async (videoPlayer, canvasRef) => {
    const context = canvasRef.getContext('2d');
    canvasRef.width = 1480;
    canvasRef.height = 1080;
    context.drawImage(videoPlayer, 0, 0, 1480, 1080);
  };

  /**
   * Скачать фото
   * @param {React.Ref} canvasRef Ref на canvas, где отображается фото
   */
  const downloadPhoto = async (canvasRef) => {
    const photo = await getPhotoByBlob(canvasRef, 'image/png', 1480, 1080);
    const url = (window.URL || window.webkitURL).createObjectURL(photo);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = `WebRTC_${new Date().toLocaleString()}.png`;
    a.click();

    // setTimeout() нужен для Firefox
    setTimeout(() => {
      (window.URL || window.webkitURL).revokeObjectURL(url);
    }, 100);
  };

  return {
    isLoading,
    isError,
    startVideoRec,
    stopVideoRec,
    downloadVideoRec,
    getVideoByBlob,
    openWebCam,
    takePhoto,
    downloadPhoto,
    getPhotoByBlob,
  };
}
