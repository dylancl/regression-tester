import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { ContentCopy, OpenInNew } from "@mui/icons-material";
import { motion } from "framer-motion";

interface UrlDisplayProps {
  /**
   * The URL to display
   */
  url: string;

  /**
   * Function to copy the URL to clipboard
   */
  onCopy: () => void;
}

/**
 * A component to display and copy URLs with hover effects
 */
const UrlDisplay: React.FC<UrlDisplayProps> = ({ url, onCopy }) => {
  const theme = useTheme();
  const [urlHovered, setUrlHovered] = useState(false);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        backgroundColor: "background.paper",
        borderRadius: 2,
        transition: theme.transitions.create([
          "background-color",
          "box-shadow",
        ]),
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" color="primary">
          Generated URL
        </Typography>
        <Tooltip title="Copy URL">
          <IconButton
            onClick={onCopy}
            color="primary"
            size="small"
            sx={{
              transition: theme.transitions.create("transform"),
              "&:hover": { transform: "scale(1.1)" },
            }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ mb: 1 }} />
      <Box
        onMouseEnter={() => setUrlHovered(true)}
        onMouseLeave={() => setUrlHovered(false)}
        sx={{
          position: "relative",
          borderRadius: 1,
          overflow: "hidden",
          transition: "all 0.25s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[2],
          },
        }}
      >
        <Box
          sx={{
            height: urlHovered ? "auto" : "40px",
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.paper, 0.2)
                : theme.palette.grey[100],
            p: 1.5,
            borderRadius: 1,
            transition: theme.transitions.create(
              ["background-color", "height"],
              {
                duration: "0.3s",
                easing: theme.transitions.easing.easeInOut,
              }
            ),
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.background.paper, 0.3)
                  : theme.palette.grey[200],
            },
          }}
        >
          {/* Always render both views, but hide one with opacity */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: urlHovered ? 0 : 1,
              height: urlHovered ? 0 : "24px",
              overflow: "hidden",
              transition: "all 0.2s ease-in-out",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "90%",
              }}
            >
              {url}
            </Typography>
            <OpenInNew
              fontSize="small"
              color="action"
              sx={{ opacity: 0.6, ml: 1 }}
            />
          </Box>

          {/* Expanded view - always in DOM but conditionally shown */}
          <motion.div
            initial={false}
            animate={{
              opacity: urlHovered ? 1 : 0,
              height: urlHovered ? "auto" : 0,
            }}
            transition={{
              duration: 0.25,
              ease: "easeInOut",
            }}
            style={{
              overflow: "hidden",
              transformOrigin: "top",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                display: "block",
                width: "100%",
                wordBreak: "break-all",
                pt: urlHovered ? 0.5 : 0,
              }}
            >
              {url}
            </Typography>
          </motion.div>
        </Box>
      </Box>
    </Paper>
  );
};

export default UrlDisplay;
