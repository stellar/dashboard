import React from 'react';
import Panel from 'muicss/lib/react/panel';
import axios from 'axios';
import find from 'lodash/find';

const knownAccounts = {
  'GCKX3XVTPVNFXQWLQCIBZX6OOPOIUT7FOAZVNOFCNEIXEZFRFSPNZKZT': 'Coins base',
  'GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP': 'Coins iss.',
  'GCGNWKCJ3KHRLPM3TM6N7D3W5YKDJFL6A2YCXFXNMRTZ4Q66MEMZ6FI2': 'Poloniex',
  'GA5XIGA5C7QTPTWXQHY6MCJRMTRZDOSHR6EFIBNDQTCQHG262N4GGKTM': 'Kraken',
  'GC2BQYBXFOVPRDH35D5HT2AFVCDGXJM5YVTAF5THFSAISYOWAJQKRESK': 'Tempo base.',
  'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S': 'Tempo iss.',
  'GB7GRJ5DTE3AA2TCVHQS2LAD3D7NFG7YLTOEWEBVRNUUI2Q3TJ5UQIFM': 'Btc38',
  'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH': 'NaoBTC',
  'GB6YPGW5JFMMP2QB2USQ33EUWTXVL4ZT5ITUNCY3YKVWOJPP57CANOF3': 'Bittrex',
  'GC4KAS6W2YCGJGLP633A6F6AKTCV4WSLMTMIQRSEQE5QRRVKSX7THV6S': 'btcid',
  'GBV4ZDEPNQ2FKSPKGJP2YKDAIZWQ2XKRQD4V4ACH3TCTFY6KPY3OAVS7': 'Changelly'
};

export default class AccountLink extends React.Component {
  render() {
    return (
      <span>
        <code>
          <a href={this.props.horizonURL+'/accounts/'+this.props.id} target="_blank">
            {this.props.id.substr(0, 4)}
          </a>
        </code>{knownAccounts[this.props.id] && this.props.id != this.props.known ? <span className="account-tag">{knownAccounts[this.props.id]}</span> : ''}
      </span>
    );
  }
}
