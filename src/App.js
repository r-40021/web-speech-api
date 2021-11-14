import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import SaveIcon from '@mui/icons-material/Save';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import LanguageIcon from '@mui/icons-material/Language';
import Menu from '@mui/material/Menu';
import GitHubIcon from '@mui/icons-material/GitHub';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Zoom from '@mui/material/Zoom';
import './App.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();
let beforemove = false;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: '「文字起こし開始」をクリックしてください',
      text: '',
      finalText: '',
      isListen: false,
      btnLabel: "文字起こし開始",
      lang: 'ja-JP',
    };
  }

  downloadAsText() {
    const content = this.state.finalText + (this.state.finalText && this.state.text ? "\n" : "") + this.state.text;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const now = new Date();
    const link = document.createElement('a');
    const y = this.addZero(now.getFullYear());
    const m = this.addZero(now.getMonth() + 1);
    const d = this.addZero(now.getDate());
    let downloadTime = 1;
    if (localStorage.getItem("todayDownload")) {
      const todayDownloadJSON = JSON.parse(localStorage.getItem("todayDownload"));
      if (todayDownloadJSON.date === y + m + d) {
        downloadTime = Number(todayDownloadJSON.time);
      }
    }
    link.href = URL.createObjectURL(blob);
    link.download = `transcription-${y}-${m}-${d}-${this.addDoubleZero(downloadTime)}.txt`;
    const nowDownloadTime = downloadTime + 1;
    const saveData = { date: y + m + d, time: nowDownloadTime };
    link.click();
    localStorage.setItem("todayDownload", JSON.stringify(saveData));
    window.onbeforeunload = null;
    beforemove = false;
  }

  addZero(int) {
    return int < 10 ? "0" + int : String(int);
  }

  addDoubleZero(int) {
    if (int < 10) {
      return "00" + int;
    } else if (int < 100) {
      return "0" + int;
    } else {
      return String(int);
    }
  }

  changeLang(index) {
    const langList = ["ja-JP", "en-US", "en-GB"];
    this.setState({ lang: langList[index - 1], });
  }


  handleClickStartStop() {
    if (this.state.isListen) {
      this.stop();
    } else {
      this.start();
    }
  }


  render() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      this.stop = () => {
        recognition.stop();
        this.setState({ status: "「文字起こし開始」をクリックしてください。", isListen: false, btnLabel: "文字起こし開始" });
      }
      this.start = () => {
        checkMicPermission(() => {
          recognition.start();
          this.setState({ status: "あなたの美声を聞き取っています...", isListen: true, btnLabel: "文字起こし停止" });
        });

      }

      let finalText = this.state.finalText;
      let interimText = '';
      recognition.onresult = (event) => {
        interimText = '';
        if (!beforemove) {
          window.onbeforeunload = function (e) {
            return false;
          }
          beforemove = true;
        }
        for (let i = event.resultIndex; i < event.results.length; i++) {
          let transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += (finalText ? "\n" : "") + transcript;
          } else {
            interimText += transcript;
          }
        }
        this.setState({ text: interimText, finalText: finalText });
        const obj = document.getElementById("body");
        obj.scrollTop = obj.scrollHeight;
      }

      recognition.lang = this.state.lang;
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onend = () => {
       if (this.state.isListen) {
          recognition.start();
        }
      }
    }
    return (
      <React.Fragment>
        <CssBaseline />
        <div>
          <MenuAppBar onclick={(index) => this.changeLang(index)} disabled={this.state.isListen} />

          <div className="btns">
            <Container maxWidth="md">
              <div className="flex-2 top-marg">
                <Button variant="contained" onClick={()=>this.handleClickStartStop()}>{this.state.btnLabel}</Button>

                <span className="status">{this.state.status}</span>
              </div>
            </Container>
          </div>
        </div>
        <div className="body" id="body">
          <Container maxWidth="md">
            {this.state.finalText.split('\n').map((str, index) => (<React.Fragment key={index}>{this.state.finalText ? <p className="resultText">{str}</p> : null}</React.Fragment>))}<p className="gray resultText">{this.state.text}</p>
          </Container>
        </div>

        <div className="fab-wrapper">
          <Tooltip title="テキストファイル形式で保存" placement="top">
            <Fab className="fab" color="primary" aria-label="add" onClick={() => { this.downloadAsText() }}>
              <SaveIcon />
            </Fab>
          </Tooltip>
        </div>
        <AlertDialogZoom />
        <AlertfornotAPI />
        <OfflineDialogZoom />

      </React.Fragment >
    );
  }
}

function MenuAppBar(props) {
  const [auth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openGitHub = () => {
    window.open("https://github.com/r-40021/web-speech-api", "_blank")
  }

  const options = [
    '話す言語を選択...',
    '日本語',
    '英語（米国）',
    '英語（英国）',
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" className="header">
        <Toolbar>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            文字起こしツール
          </Typography>
          {auth && (
            <div>
              <Tooltip title="ソースコードを見る">
                <IconButton
                  size="large"
                  aria-label="ソースコードを見る"
                  onClick={openGitHub}
                  color="inherit"
                >
                  <GitHubIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="話す言語を選択...">
                <IconButton
                  size="large"
                  aria-label="話す言語を選択"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <LanguageIcon />
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {options.map((option, index) => (
                  <MenuItem
                    key={option}
                    disabled={index === 0 || props.disabled}
                    selected={index === selectedIndex}
                    onClick={(event) => { handleMenuItemClick(event, index); props.onclick(index); }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
let handleClickOpen;

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

function AlertDialogZoom() {
  const [open, setOpen] = React.useState(false);

  handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="マイク使用許可"
      >
        <DialogTitle>{"マイクの使用を許可してください"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="マイク使用許可">
            文字起こしをするためにはマイクが必要です。<br />
            ブラウザの設定からマイクの使用を許可してください。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

async function checkMicPermission(callback) {

  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    /* ストリームを使用 */
    if (callback) {
      callback();
    }
  } catch (err) {
    /* エラーを処理 */
    handleClickOpen();
    return false;
  }
}

let openAlert2;

function AlertfornotAPI() {
  const [open, setOpen] = React.useState(false);

  openAlert2 = () => {
    setOpen(true);
  };

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="非対応ブラウザ"
      >
        <DialogTitle>{"お使いのブラウザには対応していません"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="非対応ブラウザ">
            このアプリは、Chrome、Edge、Firefoxに対応しています。
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
}
let offlineHandleClickOpen,offlineHandleClose;
function OfflineDialogZoom() {
  const [open, setOpen] = React.useState(false);

  offlineHandleClickOpen = () => {
    setOpen(true);
  };

  offlineHandleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={offlineHandleClose}
        aria-describedby="オフライン"
      >
        <DialogTitle>{"オフラインになっています"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="オフライン">
            オフライン状態では高確率で音声認識が動作しません。<br />
            インターネット接続を確認してください。
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function checkOnline(){
  if( navigator.onLine ) {
    offlineHandleClose();
  } else {
    offlineHandleClickOpen();
  }
}

window.addEventListener("load", () => {
 if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    openAlert2();
  } else {
    checkOnline()
  }
}, false);

window.addEventListener('online', function(){
  checkOnline();
});

window.addEventListener('offline', function(){
  checkOnline();
});

export default App;
