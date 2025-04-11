import React from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { FilterList, Search } from "@mui/icons-material";

interface SearchAndFilterBarProps {
  searchTerm: string;
  filterBrand: string;
  filterContext: string;
  onSearchChange: (value: string) => void;
  onBrandFilterChange: (value: string) => void;
  onContextFilterChange: (value: string) => void;
}

const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchTerm,
  filterBrand,
  filterContext,
  onSearchChange,
  onBrandFilterChange,
  onContextFilterChange,
}) => {
  return (
    <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
      <TextField
        placeholder="Search components..."
        size="small"
        InputProps={{
          startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
        }}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flexGrow: 1, minWidth: "200px" }}
      />

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="filter-brand-label">Brand</InputLabel>
        <Select
          labelId="filter-brand-label"
          value={filterBrand}
          label="Brand"
          onChange={(e: SelectChangeEvent) =>
            onBrandFilterChange(e.target.value)
          }
          startAdornment={
            <FilterList sx={{ color: "action.active", mr: 1, ml: -0.5 }} />
          }
        >
          <MenuItem value="all">All Brands</MenuItem>
          <MenuItem value="toyota">Toyota</MenuItem>
          <MenuItem value="lexus">Lexus</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="filter-context-label">Context</InputLabel>
        <Select
          labelId="filter-context-label"
          value={filterContext}
          label="Context"
          onChange={(e: SelectChangeEvent) =>
            onContextFilterChange(e.target.value)
          }
          startAdornment={
            <FilterList sx={{ color: "action.active", mr: 1, ml: -0.5 }} />
          }
        >
          <MenuItem value="all">All Contexts</MenuItem>
          <MenuItem value="used">Used</MenuItem>
          <MenuItem value="stock">Stock</MenuItem>
          <MenuItem value="new">New</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default SearchAndFilterBar;
