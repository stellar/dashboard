import React from 'react';
import Panel from 'muicss/lib/react/panel';
import axios from 'axios';
import find from 'lodash/find';

const knownAccounts = {
  'GCKX3XVTPVNFXQWLQCIBZX6OOPOIUT7FOAZVNOFCNEIXEZFRFSPNZKZT': 'Coins base',
  'GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP': 'Coins iss.',
  'GCGNWKCJ3KHRLPM3TM6N7D3W5YKDJFL6A2YCXFXNMRTZ4Q66MEMZ6FI2': 'Poloniex',
  'GA5XIGA5C7QTPTWXQHY6MCJRMTRZDOSHR6EFIBNDQTCQHG262N4GGKTM': 'Kraken',
  'GC2BQYBXFOVPRDH35D5HT2AFVCDGXJM5YVTAF5THFSAISYOWAJQKRESK': 'Tempo',
  'GB7GRJ5DTE3AA2TCVHQS2LAD3D7NFG7YLTOEWEBVRNUUI2Q3TJ5UQIFM': 'Btc38',
  'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH': 'NaoBTC'
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
