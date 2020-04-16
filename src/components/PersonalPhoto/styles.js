import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  containerRoot: {
    flexGrow: 1,
    marginTop: theme.spacing(6),
    textAlign: 'center',
  },
  item: {
    padding: 20,
  },
  button: {
    margin: theme.spacing(1),
  },
  player: {
    width: '100%',
    backgroundColor: '#DDD',
  },
  imgCanvas: {
    width: '100%',
    backgroundColor: '#DDD',
  },
  hidden: {
    display: 'none',
  },
}));

export default useStyles;
