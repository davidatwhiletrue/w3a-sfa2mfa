import React from 'react';
import './App.css';
import styled from "styled-components";
import {criticalResetAccount, getPublicAddress, initializeTkey, removeNonce} from "./torus/tkey";

export const Button = styled.button`
  background: transparent;
  border-radius: 3px;
  border: 2px solid #BF4F74;
  color: #BF4F74;
  margin: 0 1em;
  padding: 0.25em 1em;
`

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
`

export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  padding: 24px;
`

function App() {
  const postboxInputRef = React.useRef(null);
  const verifierIdInputRef = React.useRef(null);

    const handleResetAccount = async () => {
        const postboxKey = postboxInputRef.current.value || '0';
        await initializeTkey(postboxKey)
    }

  const handleConnectTKEYSFA = async () => {
    const postboxKey = postboxInputRef.current.value || '0';

    // first, reset any previous created account
    await criticalResetAccount(postboxKey);

    // now, initializeKey deleting nonce
    await initializeTkey(postboxKey)

    const verifierId = verifierIdInputRef.current.value || '0';

    await getPublicAddress(verifierId)
  }

  const handleRemoveNonce = async () => {
      const postboxKey = postboxInputRef.current.value || '0';

      // set metadata to remove nonce
      await removeNonce(postboxKey)
  }

  return (
    <div className="App">
    <FlexRow>
      Verifier Id: <input type="text" ref={verifierIdInputRef} />
    </FlexRow>
      <FlexRow>
        Postbox Key: <input type="text" ref={postboxInputRef} />
      </FlexRow>
      <FlexRow>
        <Button onClick={handleConnectTKEYSFA}>CRITICAL Initialize TKEY with delete1OutOf1</Button>
      </FlexRow>
      <FlexRow>
        <Button onClick={handleRemoveNonce}>CRITICAL Remove nonce</Button>
      </FlexRow>
    </div>
  );
}

export default App;
