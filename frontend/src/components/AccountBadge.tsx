import { knownAccounts } from "constants/knownAccounts";
import { useState } from "react";

interface AccountBadgeProps {
  horizonURL: string;
  id: string;
  account?: string;
}

interface ObjectAccount {
  url: string;
  name: string;
  icon: string;
}

export const AccountBadge: React.FC<AccountBadgeProps> = ({
  horizonURL,
  id,
  account,
}) => {
  const [isObjectAccount, setIsObjectAccount] = useState<ObjectAccount>();

  const convertedId = id as unknown as keyof typeof knownAccounts;

  if (
    knownAccounts[convertedId] ===
    "GDCIUCGL7VEMMF6VYJOW75KQ5ZCLHAQBRM6EPFTKCRWUYVUOOYQCKC5A"
  ) {
    setIsObjectAccount(knownAccounts[convertedId] as ObjectAccount);
  }

  return (
    <span>
      <code>
        <a
          className="RecentOperations__TextLink"
          href={horizonURL + "/accounts/" + id}
          target="_blank"
          rel="noreferrer"
        >
          {id.substring(0, 4)}
        </a>
      </code>

      {knownAccounts[convertedId] &&
        id !== account &&
        (isObjectAccount ? (
          <a
            href={isObjectAccount.url}
            target="_blank"
            title={isObjectAccount.name}
            rel="noreferrer"
          >
            <img src={isObjectAccount.icon} alt="" />
          </a>
        ) : (
          <span className="account-tag">{knownAccounts[convertedId]}</span>
        ))}
    </span>
  );
};
