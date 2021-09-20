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
import './App.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

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
      hideStart: null,
      hideStop: 'hide',
      lang: 'ja-JP',
    };
  }

  downloadAsText() {
    const content = this.state.finalText;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const now = new Date();
    const link = document.createElement('a');
    const y = this.addZero(now.getFullYear());
    const m = this.addZero(now.getMonth() + 1);
    const d = this.addZero(now.getDate());
    let downloadTime = 1;
    if (localStorage.getItem("todayDownload")){
     const todayDownloadJSON = JSON.parse(localStorage.getItem("todayDownload"));
     if(todayDownloadJSON.date === y+m+d){
       downloadTime = Number(todayDownloadJSON.time);
     }
    }
    link.href = URL.createObjectURL(blob);
    link.download = `transcription-${y}-${m}-${d}-${this.addDoubleZero(downloadTime)}.txt`;
    const nowDownloadTime = downloadTime + 1;
    const saveData = {date:y+m+d, time:nowDownloadTime};
    link.click();
    localStorage.setItem("todayDownload", JSON.stringify(saveData));
    window.onbeforeunload = null;
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


  render() {
    if (typeof SpeechRecognition === 'undefined') {
      this.setState({ status: 'このサイトは、Chrome、Edge、Firefoxにのみ対応しています。' })
    } else {
      this.stop = () => {
        recognition.abort();
        this.setState({ status: "「文字起こし開始」をクリックしてください。", isListen: false, hideStart: null, hideStop: "hide", });
      }
      this.start = () => {
        recognition.start();
        this.setState({ status: "あなたの美声を聞き取っています...", isListen: true, hideStart: "hide", hideStop: null, });
      }

      let finalText = this.state.finalText;
      let interimText = '';
      recognition.onresult = (event) => {
        interimText = '';
        if(!beforemove){
          window.onbeforeunload = function(e) {
            return false;
          }
          beforemove = true;
        }
        for (let i = event.resultIndex; i < event.results.length; i++) {
          let transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += (finalText ? "\n\n" : "") + transcript;
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
      recognition.continuous = true
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
          <MenuAppBar onclick={(index) => this.changeLang(index)} />

          <div className="btns">
            <Container maxWidth="sm">
              <div className="flex-2 top-marg">
                <Button variant="contained" className={this.state.hideStart} onClick={() => this.start()}>文字起こし開始</Button>
                <Button variant="contained" className={this.state.hideStop} onClick={() => this.stop()}>文字起こし停止</Button>

                <span className="status">{this.state.status}</span>
              </div>
            </Container>
          </div>
        </div>
        <div className="body" id="body">
          <Container maxWidth="sm">
            {this.state.finalText.split('\n').map((str, index) => (<React.Fragment key={index}>{str}<br /></React.Fragment>))}<span className="gray">{this.state.text}</span>
          </Container>
        </div>

        <div className="fab-wrapper">
          <Tooltip title="テキストファイル形式で保存" placement="top">
            <Fab className="fab" color="primary" aria-label="add" onClick={() => { this.downloadAsText() }}>
              <SaveIcon />
            </Fab>
          </Tooltip>
        </div>

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
    '音声認識で検出する言語を選択',
    '日本語',
    '英語（米国）',
    '英語（英国）',
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
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

              <Tooltip title="検出する言語を変更">
              <IconButton
                size="large"
                aria-label="検出する言語を変更"
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
                    disabled={index === 0}
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


export default App;
