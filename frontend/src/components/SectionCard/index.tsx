import { Card, TextLink, Icon, Loader } from "@stellar/design-system";

import "./styles.scss";

interface SectionCardProps {
  title: string;
  titleIcon?: React.ReactNode;
  titleLinkLabel?: string;
  titleLink?: string;
  titleCustom?: React.ReactNode;
  isLoading?: boolean;
  noData?: boolean;
  children: React.ReactNode;
}

export const SectionCard = ({
  title,
  titleIcon,
  titleLinkLabel = "Link",
  titleLink,
  titleCustom,
  isLoading,
  noData,
  children,
}: SectionCardProps) => {
  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (noData) {
      return "Something went wrong";
    }

    return children;
  };

  return (
    <Card>
      <div className="SectionCard__heading">
        <div className="SectionCard__heading__title">
          {titleIcon ?? null}
          {title}
        </div>

        <div className="SectionCard__heading__options">
          {titleCustom ?? null}
          {titleLink ? (
            <TextLink href={titleLink} iconRight={<Icon.ExternalLink />}>
              {titleLinkLabel}
            </TextLink>
          ) : null}
        </div>
      </div>
      {renderContent()}
    </Card>
  );
};
