import React from 'react';
import Typography from '@material-ui/core/Typography';
import Form from './components/Form/Form';

function App() {
  return (
    <div className="App">
      <Typography variant="h5" className="title">
        Фото/видео с камеры Вашего устройства
      </Typography>
      <Form />
    </div>
  );
}

export default App;
