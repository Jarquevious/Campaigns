import { createMuiTheme } from '@material-ui/core/styles';

export function campaignTheme (topNav, heightOfBar) {
  const defaultTheme = createMuiTheme();

  return createMuiTheme({
    typography: {
      button: {
        textTransform: 'none',
      },
    },
    overrides: {
      MuiTab: {
        root: {
          minHeight: 0,
        },
      },
      MuiTabs: {
        fixed: {
          height: 40,
        },
      },
      MuiAppBar: {
        root: {
          borderBottom: topNav ? 0 : '1px solid #ddd',
          boxShadow: 'none',
          minHeight: 0,
          flexGrow: 1,
          height: heightOfBar,
          paddingTop: topNav ? 14 : '',
          [defaultTheme.breakpoints.down('sm')]: {
            display: topNav ? 'none !important' : '',
          },
        },
        colorDefault: {
          backgroundColor: defaultTheme.palette.background.paper,
        },
      },
      MuiToolbar: {
        root: {
          minHeight: '0 !important',
        },
      },
      MuiButtonBase: {
        root: {
          '&:hover': {
            color: '#4371cc',
          },
        },
      },
    },
  });
}

export function dummy () {
  return 'dummy';
}
