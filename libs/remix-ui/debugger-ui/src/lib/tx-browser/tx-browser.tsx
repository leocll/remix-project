import React, { useState, useEffect, useRef } from 'react'  //eslint-disable-line
import './tx-browser.css'

export const TxBrowser = ({ requestDebug, updateTxNumberFlag, unloadRequested, transactionNumber, debugging, debuggerInstance }) => {
  const [state, setState] = useState({
    txNumber: ''
  })

  const inputValue = useRef(null)
  useEffect(() => {
    setState(prevState => {
      return {
        ...prevState,
        txNumber: transactionNumber
      }
    })
  }, [transactionNumber])

  const handleSubmit = () => {
    if (debugging) {
      unload()
    } else {
      requestDebug(undefined, state.txNumber)
    }
  }

  const unload = () => {
    unloadRequested()
  }

  const txInputChanged = (value) => {
    // todo check validation of txnumber in the input element, use
    // required
    // oninvalid="setCustomValidity('Please provide a valid transaction number, must start with 0x and have length of 22')"
    // pattern="^0[x,X]+[0-9a-fA-F]{22}"
    // this.state.txNumberInput.setCustomValidity('')
    setState(prevState => {
      return {
        ...prevState,
        txNumber: value
      }
    })
  }

  const txInputOnInput = () => {
    updateTxNumberFlag(!inputValue.current.value)
  }

  const getDebugInfo = async () => {
    return new Promise((resolve, reject) => {
      debuggerInstance.debugger.web3.debug.getDebugInfo((error, info) => {
        if (error) {
          reject(error)
        } else {
          resolve(info)
        }
      })
    })
  }

  const downloadDebugInfo = async () => {
    const info = await getDebugInfo()
    const output = await debuggerInstance.compilationResult()
    info['output'] = output
    const blob = new Blob([JSON.stringify(info)], {type: 'application/json'})//{type: 'text/plain'});
    console.log(blob);
    const url = URL.createObjectURL(blob);
    console.log(url);
    downloadFile(url);
  }

  const downloadFile = (sUrl) => {
    //iOS devices do not support downloading. We have to inform user about this.
    if (/(iP)/g.test(navigator.userAgent)) {
      alert('Your device does not support files downloading. Please try again in desktop browser.');
      return false;
    }

    //If in Chrome or Safari - download via virtual link click
    const isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    const isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
    if (isChrome || isSafari) {
      //Creating new link node.
      var link = document.createElement('a');
      link.href = sUrl;

      if (link.download !== undefined) {
          //Set HTML5 download attribute. This will prevent file from opening if supported.
          var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
          link.download = fileName;
      }

      //Dispatching click event.
      if (document.createEvent) {
        var e = document.createEvent('MouseEvents');
        e.initEvent('click', true, true);
        link.dispatchEvent(e);
        return true;
      }
    }

    // Force file download (whether supported by server).
    if (sUrl.indexOf('?') === -1) {
      sUrl += '?download';
    }

    window.open(sUrl, '_self');
    return true;
  }

  return (
    <div className='container px-0'>
      <div className='txContainer'>
        <div className='py-1 d-flex justify-content-center w-100 input-group'>
          <input
            ref={inputValue}
            value={state.txNumber}
            className='form-control m-0 txinput'
            id='txinput'
            type='text'
            onChange={({ target: { value } }) => txInputChanged(value)}
            onInput={txInputOnInput}
            placeholder={'Transaction hash, should start with 0x'}
            data-id='debuggerTransactionInput'
            disabled={debugging}
          />
        </div>
        <div className='d-flex justify-content-center w-100 btn-group py-1'>
          <button
            className='btn btn-primary btn-sm txbutton'
            id='load'
            title={debugging ? 'Stop debugging' : 'Start debugging'}
            onClick={handleSubmit}
            data-id='debuggerTransactionStartButton'
            disabled={!state.txNumber }
          >
            { debugging ? 'Stop' : 'Start' } debugging
          </button>
        </div>
        <div className='d-flex justify-content-center w-100 btn-group py-1'>
          <button
            className='btn btn-primary btn-sm txbutton'
            id='load'
            title='Download debug info'
            onClick={downloadDebugInfo}
            data-id='debuggerTransactionStartButton'
            disabled={!debugging }
          >
            Download debug info
          </button>
        </div>
      </div>
      <span id='error' />
    </div>
  )
}

export default TxBrowser
