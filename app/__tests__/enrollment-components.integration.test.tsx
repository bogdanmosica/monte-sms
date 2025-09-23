import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnrollmentStats } from '@/app/(admin)/admin/enrollment/components/EnrollmentStats';
import { SearchAndFilter } from '@/app/(admin)/admin/enrollment/components/SearchAndFilter';
import { EnrollmentTabs } from '@/app/(admin)/admin/enrollment/components/EnrollmentTabs';

// Mock data
const mockApplications = [
  {
    id: '1',
    childName: 'Oliver Thompson',
    parentName: 'Jennifer Thompson',
    email: 'jennifer.thompson@email.com',
    phone: '(555) 123-4567',
    address: '456 Oak Street, Education City, EC 12345',
    birthdate: '2019-05-12',
    age: 4,
    appliedDate: '2024-01-10',
    status: 'pending',
    preferredStartDate: '2024-02-01',
    notes: 'Child has previous Montessori experience.',
  },
  {
    id: '2',
    childName: 'Ava Martinez',
    parentName: 'Carlos Martinez',
    email: 'carlos.martinez@email.com',
    phone: '(555) 234-5678',
    address: '789 Pine Avenue, Education City, EC 12345',
    birthdate: '2018-09-22',
    age: 5,
    appliedDate: '2024-01-08',
    status: 'approved',
    preferredStartDate: '2024-01-22',
    notes: 'Family relocating from another state.',
  },
];

const mockStudents = [
  {
    id: '1',
    name: 'Emma Wilson',
    age: 4,
    classroom: 'Toddler Room A',
  },
  {
    id: '2',
    name: 'Liam Johnson',
    age: 5,
    classroom: 'Pre-K Room B',
  },
];

describe('EnrollmentStats Component Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all stat cards with correct data', () => {
    render(
      <EnrollmentStats
        currentStudents={25}
        pendingApplications={8}
        approvedApplications={3}
        totalCapacity={50}
      />
    );

    // Check if all stat cards are rendered
    expect(screen.getByText('Current Students')).toBeInTheDocument();
    expect(screen.getByText('Pending Applications')).toBeInTheDocument();
    expect(screen.getByText('Approved This Month')).toBeInTheDocument();
    expect(screen.getByText('Available Spots')).toBeInTheDocument();

    // Check if the numbers are correct
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument(); // 50 - 25 = 25 available spots

    // Check descriptions
    expect(screen.getByText('Active enrollments')).toBeInTheDocument();
    expect(screen.getByText('Awaiting review')).toBeInTheDocument();
    expect(screen.getByText('Ready to enroll')).toBeInTheDocument();
    expect(screen.getByText('Out of 50 capacity')).toBeInTheDocument();
  });

  it('should calculate available spots correctly', () => {
    render(
      <EnrollmentStats
        currentStudents={45}
        pendingApplications={5}
        approvedApplications={2}
        totalCapacity={50}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument(); // 50 - 45 = 5 available spots
  });

  it('should handle zero values gracefully', () => {
    render(
      <EnrollmentStats
        currentStudents={0}
        pendingApplications={0}
        approvedApplications={0}
        totalCapacity={50}
      />
    );

    const zeroElements = screen.getAllByText('0');
    expect(zeroElements).toHaveLength(3); // Three stats should show 0
    expect(screen.getByText('50')).toBeInTheDocument(); // Available spots should be 50
  });
});

describe('SearchAndFilter Component Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input and filter buttons', () => {
    render(<SearchAndFilter />);

    expect(screen.getByPlaceholderText('Search by child name, parent name, or email...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
  });

  it('should call onSearchChange when typing in search input', async () => {
    const mockOnSearchChange = vi.fn();

    render(
      <SearchAndFilter
        onSearchChange={mockOnSearchChange}
        searchValue=""
      />
    );

    const searchInput = screen.getByPlaceholderText('Search by child name, parent name, or email...');

    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(mockOnSearchChange).toHaveBeenCalledWith('John');
  });

  it('should call onFilterClick when filter button is clicked', () => {
    const mockOnFilterClick = vi.fn();

    render(<SearchAndFilter onFilterClick={mockOnFilterClick} />);

    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);

    expect(mockOnFilterClick).toHaveBeenCalledTimes(1);
  });

  it('should display current search value', () => {
    render(
      <SearchAndFilter
        searchValue="Oliver"
        onSearchChange={vi.fn()}
      />
    );

    const searchInput = screen.getByDisplayValue('Oliver');
    expect(searchInput).toBeInTheDocument();
  });

  it('should use custom placeholder when provided', () => {
    const customPlaceholder = 'Search students...';

    render(
      <SearchAndFilter
        placeholder={customPlaceholder}
      />
    );

    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });
});

describe('EnrollmentTabs Component Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all three tabs', () => {
    render(
      <EnrollmentTabs
        applications={mockApplications}
        currentStudents={mockStudents}
      />
    );

    expect(screen.getByRole('tab', { name: 'Applications' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Current Students' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Waitlist' })).toBeInTheDocument();
  });

  it('should display applications in the Applications tab', () => {
    render(
      <EnrollmentTabs
        applications={mockApplications}
        currentStudents={mockStudents}
      />
    );

    // Applications tab should be active by default
    expect(screen.getByText('Oliver Thompson')).toBeInTheDocument();
    expect(screen.getByText('Ava Martinez')).toBeInTheDocument();
    expect(screen.getByText('jennifer.thompson@email.com')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
  });

  it('should display current students when switching to Current Students tab', async () => {
    render(
      <EnrollmentTabs
        applications={mockApplications}
        currentStudents={mockStudents}
      />
    );

    const currentStudentsTab = screen.getByRole('tab', { name: 'Current Students' });
    fireEvent.click(currentStudentsTab);

    await waitFor(() => {
      expect(screen.getByText('Emma Wilson')).toBeInTheDocument();
      expect(screen.getByText('Liam Johnson')).toBeInTheDocument();
      expect(screen.getByText('Toddler Room A')).toBeInTheDocument();
      expect(screen.getByText('Pre-K Room B')).toBeInTheDocument();
    });
  });

  it('should display empty waitlist message in Waitlist tab', async () => {
    render(
      <EnrollmentTabs
        applications={mockApplications}
        currentStudents={mockStudents}
      />
    );

    const waitlistTab = screen.getByRole('tab', { name: 'Waitlist' });
    fireEvent.click(waitlistTab);

    await waitFor(() => {
      expect(screen.getByText('No students on waitlist')).toBeInTheDocument();
      expect(screen.getByText(/Students waiting for available spots will appear here/)).toBeInTheDocument();
    });
  });

  it('should call action handlers when buttons are clicked', async () => {
    const mockHandlers = {
      onViewApplication: vi.fn(),
      onScheduleInterview: vi.fn(),
      onApprove: vi.fn(),
      onReject: vi.fn(),
    };

    render(
      <EnrollmentTabs
        applications={mockApplications}
        currentStudents={mockStudents}
        {...mockHandlers}
      />
    );

    // Test application action buttons
    const viewButton = screen.getAllByText('View Full Application')[0];
    fireEvent.click(viewButton);
    expect(mockHandlers.onViewApplication).toHaveBeenCalledWith('1');

    const approveButton = screen.getAllByText('Approve')[0];
    fireEvent.click(approveButton);
    expect(mockHandlers.onApprove).toHaveBeenCalledWith('1');
  });

  it('should call student action handlers when buttons are clicked', async () => {
    const mockHandlers = {
      onViewProfile: vi.fn(),
      onContactParent: vi.fn(),
      onEditDetails: vi.fn(),
    };

    render(
      <EnrollmentTabs
        applications={mockApplications}
        currentStudents={mockStudents}
        {...mockHandlers}
      />
    );

    // Switch to Current Students tab
    const currentStudentsTab = screen.getByRole('tab', { name: 'Current Students' });
    fireEvent.click(currentStudentsTab);

    await waitFor(() => {
      const viewProfileButton = screen.getAllByText('View Profile')[0];
      fireEvent.click(viewProfileButton);
      expect(mockHandlers.onViewProfile).toHaveBeenCalledWith('1');
    });
  });

  it('should display correct status badges with proper styling', () => {
    render(
      <EnrollmentTabs
        applications={mockApplications}
        currentStudents={mockStudents}
      />
    );

    const pendingBadge = screen.getByText('pending');
    const approvedBadge = screen.getByText('approved');

    expect(pendingBadge).toBeInTheDocument();
    expect(approvedBadge).toBeInTheDocument();

    // Check if badges have the correct CSS classes (basic test)
    expect(pendingBadge.closest('[class*="border"]')).toBeInTheDocument();
    expect(approvedBadge.closest('[class*="border"]')).toBeInTheDocument();
  });

  it('should format dates correctly in application cards', () => {
    render(
      <EnrollmentTabs
        applications={mockApplications}
        currentStudents={mockStudents}
      />
    );

    // Check if dates are displayed (exact format may vary based on locale)
    expect(screen.getByText(/Applied:/)).toBeInTheDocument();
    expect(screen.getByText(/Preferred Start:/)).toBeInTheDocument();
    expect(screen.getByText(/Birth Date:/)).toBeInTheDocument();
  });

  it('should handle empty applications array gracefully', () => {
    render(
      <EnrollmentTabs
        applications={[]}
        currentStudents={mockStudents}
      />
    );

    // Applications tab should still render without errors
    expect(screen.getByRole('tab', { name: 'Applications' })).toBeInTheDocument();
  });

  it('should handle empty students array gracefully', async () => {
    render(
      <EnrollmentTabs
        applications={mockApplications}
        currentStudents={[]}
      />
    );

    const currentStudentsTab = screen.getByRole('tab', { name: 'Current Students' });
    fireEvent.click(currentStudentsTab);

    await waitFor(() => {
      // Tab should render without errors even with empty students
      expect(currentStudentsTab).toBeInTheDocument();
    });
  });
});