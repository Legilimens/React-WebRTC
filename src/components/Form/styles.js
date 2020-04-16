import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  containerRoot: {
    flexGrow: 1,
    margin: theme.spacing(4),
    textAlign: 'center',
  },
  photoBtn: {
    height: 50,
    position: 'relative',
    top: 3,
  }
}));

export default useStyles;
