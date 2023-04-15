import { Heading, Box, Button } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";

interface HeaderProps {
  readonly label: string;
  readonly size: string | any;
}

const Header = ({ label, size }: HeaderProps) => {
  const { pathname } = useLocation();

  const isSettings = pathname === "/settings";

  return (
    <Box>
      <Link to={isSettings ? "/" : "/settings"}>
        <Button
          position="absolute"
          top={{ base: "1", md: "2" }}
          right={{ base: "1", md: "3" }}
          size={{ base: "sm", md: "md" }}
        >
          {isSettings ? "Back" : "Settings"}
        </Button>
      </Link>
      <Heading as="h1" size={size}>
        {label}
      </Heading>
    </Box>
  );
};

export default Header;
