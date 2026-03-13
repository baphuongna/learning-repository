# Authenticated UI Redesign - Design Specification

**Date:** 2026-03-13
**Status:** Draft
**Author:** Design Session

---

## Overview

Thiết kế lại toàn bộ trải nghiệm UI/UX cho người dùng sau khi đăng nhập trong `apps/web`, tập trung vào việc biến khu vực `(dashboard)` từ tập hợp page rời rạc thành một workspace thống nhất, dễ dùng, hiện đại và mở rộng tốt cho nhiều vai trò.

### Goals
- Tạo một shell chung rõ ràng cho toàn bộ khu vực sau đăng nhập
- Giảm cognitive load trong navigation hiện tại đang dồn nhiều link vào header
- Tăng hiệu quả thao tác cho user thường, power user và admin
- Chuẩn hóa trải nghiệm giữa documents, news, profile và admin pages
- Giữ cảm giác “nền tảng tri thức” nhưng theo ngôn ngữ sản phẩm hiện đại hơn

### Assumptions
- Đối tượng sử dụng là hỗn hợp `USER`, power user và `ADMIN`
- Navigation direction mặc định là **hybrid responsive**
- Visual tone mặc định là **balanced** giữa Modern SaaS và Editorial / Knowledge Platform
- Không có phản hồi phủ định với các hướng đề xuất trong phiên brainstorming, nên các recommendation được xem là default direction

### Out of Scope
- Thay đổi backend API
- Thay đổi database schema
- Thiết kế lại khu vực public trước đăng nhập
- Thêm role/permission model mới
- Viết code implementation trong spec này

---

## Current State Summary

### Existing Structure
- Route group sau đăng nhập nằm trong `apps/web/app/(dashboard)`
- Shared shell hiện tại ở `apps/web/app/(dashboard)/layout.tsx`
- Header hiện tại ở `apps/web/components/features/layout/Header.tsx`
- Breadcrumb hiện tại ở `apps/web/components/features/layout/DashboardBreadcrumb.tsx`
- Navigation items hiện tại ở `apps/web/components/features/layout/dashboard-nav-items.ts`

### Current UX Issues
- Header đang gánh quá nhiều navigation links cho khu vực authenticated
- Dashboard overview hiện mới đóng vai trò page trung gian, chưa phải trang điều phối công việc
- Documents và My News có tính năng tương đối đủ nhưng mental model chưa thật sự thống nhất
- Profile, change-password và account-related flows đang bị tách rời theo hướng kỹ thuật hơn là theo trải nghiệm người dùng
- Admin area dùng chung hệ thống nhưng cảm giác chưa được tổ chức thành một layer rõ ràng trong overall UX
- Visual hierarchy chưa thật sự nhất quán: gradient, card emphasis, spacing, và density chưa có quy luật chặt

---

## Design Direction

### Chosen Direction
**Productivity Workspace** là hướng chính.

Đây là một authenticated experience theo kiểu workspace, trong đó:
- shell ưu tiên hiệu quả thao tác
- dashboard đóng vai trò command center
- nội dung vẫn giữ chất knowledge platform thông qua typography, content hierarchy và information density hợp lý

### Why This Direction
- Phù hợp nhất với sản phẩm có nhiều loại tác vụ: xem tài liệu, upload, chỉnh sửa nội dung, quản trị
- Scale tốt hơn so với mô hình header-only navigation hiện tại
- Dễ thích nghi theo role mà không phải tách thành nhiều hệ thống UI riêng

### Rejected Alternatives

#### Knowledge Hub as primary direction
- Ưu điểm: giàu tính nội dung, hợp branding
- Không chọn làm hướng chính vì sẽ làm giảm tính task-oriented cho khu vực sau đăng nhập

#### Role-Adaptive Control Center as primary direction
- Ưu điểm: cá nhân hóa tốt
- Không chọn làm hướng chính vì complexity cao hơn, dễ tạo fragmentation giữa các vai trò

---

## Information Architecture

### Global Shell Model

#### Desktop
- Sidebar trái cố định là điều hướng chính
- Topbar mỏng là lớp utility
- Content area ưu tiên chiều rộng và khả năng scan nhanh

#### Tablet / Mobile
- Sidebar chuyển thành drawer hoặc overlay menu
- Topbar rút gọn còn các utility chính
- Quick actions và page actions được đưa lên vùng dễ chạm

### Navigation Model

Navigation được nhóm theo nhiệm vụ thay vì phản chiếu route kỹ thuật.

#### Sidebar Groups
- **Tổng quan**
  - Dashboard
- **Tài liệu**
  - Tất cả tài liệu
  - Tài liệu của tôi
  - Tải lên
- **Nội dung**
  - Bài viết của tôi
- **Công cụ**
  - Rust Inspector
- **Tài khoản**
  - Hồ sơ cá nhân
  - Đổi mật khẩu (hoặc Security section trong Account area)
- **Quản trị** *(admin only)*
  - Quản lý tin tức
  - Quản lý danh mục

### Topbar Responsibilities
- Global search entry point
- Short breadcrumb / current context
- Contextual primary action của page hiện tại
- Theme switch
- User menu

### User Menu Responsibilities
- Tóm tắt user identity
- Đi tới account area
- Lối thoát logout
- Không dùng user menu để thay thế toàn bộ navigation hệ thống

---

## Section Specifications

### 1. Authenticated Shell

**Primary files impacted:**
- `apps/web/app/(dashboard)/layout.tsx`
- `apps/web/components/features/layout/Header.tsx`
- `apps/web/components/features/layout/dashboard-nav-items.ts`
- `apps/web/components/features/layout/DashboardBreadcrumb.tsx`

#### Proposed Structure
```tsx
<AppShell>
  <Sidebar />
  <ShellBody>
    <Topbar />
    <PageContainer>
      <Breadcrumb />
      <PageHeader />
      <PageContent />
    </PageContainer>
  </ShellBody>
</AppShell>
```

#### Behavior
- Sidebar là navigation source of truth trên desktop
- Header hiện tại được refactor thành topbar utility-oriented
- Breadcrumb giữ lại nhưng rút gọn, không cạnh tranh với page heading
- Footer trong authenticated area được giảm prominence để không làm loãng workspace feel

#### UX Outcomes
- User luôn hiểu mình đang ở section nào
- Điều hướng chính không còn bị nhồi vào một hàng ngang ở header
- Layout sẵn sàng cho việc thêm feature mà không cần bẻ gãy navigation

---

### 2. Dashboard Homepage Experience

**Primary file impacted:**
- `apps/web/components/dashboard/DashboardOverview.tsx`

#### Role in the system
Dashboard không còn là page chào mừng đơn thuần. Nó trở thành trang điều phối công việc sau login.

#### Proposed Blocks

##### Welcome / Utility Hero
- Chào user bằng tên
- Một dòng system summary hoặc progress context
- 2–3 CTA tùy role

##### Recent Work
- Tài liệu gần đây
- Bài viết gần đây
- Mục vừa chỉnh sửa hoặc truy cập gần đây

##### Quick Actions
- Upload document
- Create / edit news
- Open Rust Inspector
- Edit profile

##### Personal / Role Summary
- Tổng số tài liệu
- Tổng số bài viết / draft
- Vai trò hiện tại
- Admin-only operational summary nếu cần

#### Layout guidance
- Desktop: cột chính cho recent work và work modules, cột phụ cho stats + actions
- Mobile: ưu tiên recent work và action-first ordering

#### UX Outcomes
- Dashboard có giá trị thực tế ngay sau login
- Người dùng quay lại dễ tiếp tục công việc dở dang
- Giảm số lần click để đi tới tác vụ quan trọng

---

### 3. Documents Experience

**Primary files impacted:**
- `apps/web/app/(dashboard)/documents/page.tsx`
- `apps/web/app/(dashboard)/my-documents/page.tsx`
- `apps/web/components/features/documents/DocumentList.tsx`
- `apps/web/components/features/folders/FolderTree.tsx`
- `apps/web/components/features/folders/FolderBreadcrumb.tsx`

#### Page Model

##### Context Bar
- Title
- Breadcrumb / folder path
- Search
- Filter / sort
- Primary action: upload hoặc create folder

##### Navigation Panel
- Folder tree trên desktop
- Drawer/sheet trên mobile
- State rõ ràng cho folder active / expanded / empty

##### Content Canvas
- Grid / list toggle
- Document cards hoặc table rows
- Empty / loading / error states theo ngữ cảnh thật

#### UX Improvements
- Search đặt ở vị trí cố định, dễ truy cập
- Filter/sort có visible active state
- Folder hierarchy rõ ràng hơn bằng indent, icon state, contextual actions
- Không để actions quan trọng chìm trong layout hiện tại

#### UX Outcomes
- Documents page trở thành workspace thay vì chỉ là list feature
- User dễ hiểu mình đang ở đâu trong folder hierarchy
- Tăng khả năng scan và giảm thao tác thừa

---

### 4. News / Content Management Experience

**Primary files impacted:**
- `apps/web/app/(dashboard)/my-news/page.tsx`
- `apps/web/app/(dashboard)/admin/news/page.tsx`
- `apps/web/components/features/news/MyNewsList.tsx`
- `apps/web/components/features/news/NewsCard.tsx`

#### Design Principle
Documents và News phải dùng cùng một UX grammar để user không phải học lại interface cho mỗi module.

#### Proposed Improvements
- Page header chuẩn hóa: title + subtitle + primary action
- Search, filter, sort, status chips đặt ở cùng vùng chức năng như documents
- Card/list/table states dùng cùng spacing, badge language, action positioning
- Draft / published / featured / admin moderation states rõ ràng hơn

#### Admin-specific behavior
- Admin list có thể giữ table view làm primary mode
- Bulk actions và status clarity được tăng prominence
- Nhưng vẫn dùng cùng shell, same typography, same component language

#### UX Outcomes
- Giảm fragmentation giữa user content management và admin management
- Dễ mở rộng về sau nếu thêm content types khác

---

### 5. Account Area

**Primary files impacted:**
- `apps/web/app/(dashboard)/profile/page.tsx`
- `apps/web/app/(dashboard)/change-password/page.tsx`

#### Proposed Direction
Tái tổ chức account-related experience thành một cụm thống nhất thay vì các page rời theo logic kỹ thuật.

#### Proposed Sections
- Hồ sơ cá nhân
- Avatar
- Thông tin tài khoản
- Bảo mật
- Tùy chọn giao diện

#### UX Model
- Overview + settings layout
- Profile summary rõ ràng hơn
- Security actions đặt trong cùng account area hoặc cùng navigation group
- Save states, validation feedback, success/error messaging nhất quán hơn

#### UX Outcomes
- User dễ hiểu “đây là khu cài đặt cá nhân”
- Giảm việc phải nhảy giữa các page nhỏ để hoàn tất một tác vụ liên quan đến account

---

### 6. Admin Experience

**Primary files impacted:**
- `apps/web/app/(dashboard)/admin/news/page.tsx`
- `apps/web/app/(dashboard)/admin/categories/page.tsx`

#### Direction
- Admin ở trong cùng authenticated shell
- Sidebar có section admin riêng
- Dashboard/admin pages dùng density và action model phù hợp hơn cho công việc quản trị

#### Principles
- Không tách thành một UI system khác
- Khác biệt nằm ở navigation scope, dashboard widgets, action density và table behavior
- Giữ consistency với phần còn lại của app

#### UX Outcomes
- Admin không cảm thấy bị “ném” sang một app khác
- Dễ bảo trì và mở rộng component system

---

## Visual System

### Design Tone
- Base tone: clean, professional, calm
- Accent tone: knowledge-centric, có phân cấp nội dung tốt

### Surface Hierarchy
- Background page nhẹ, ít nhiễu
- Card/panel có cấp độ rõ ràng
- Utility surfaces và action surfaces nổi bật vừa đủ

### Typography
- Tiếp tục tận dụng body font dễ đọc
- Display font dùng tiết chế cho heading/highlight
- Ưu tiên readability và scanability trong authenticated area

### Color Usage
- Primary color cho CTA, active, selection
- Functional colors cho status/badges
- Giảm lạm dụng gradient; chỉ dùng ở đúng chỗ nhấn mạnh

### Density & Spacing
- Giữ spacing system nhất quán giữa documents, news, profile, admin
- Tăng contrast giữa page sections bằng hierarchy thay vì quá nhiều decoration

---

## Responsive Strategy

### Desktop
- Sidebar cố định
- Contextual panel / secondary column khi cần
- Information density cao hơn

### Tablet
- Sidebar thu gọn hoặc overlay
- Topbar giữ utility quan trọng

### Mobile
- Navigation qua drawer hoặc bottom sheet
- Actions ưu tiên vùng dễ chạm
- Bảng dữ liệu lớn chuyển thành stacked cards khi cần
- Search / filter không làm che lấp nội dung quá mức

---

## State Design

### Loading
- Ưu tiên skeleton theo layout thật
- Chỉ dùng full-page loading cho auth/session restore hoặc route-level waiting rõ ràng

### Empty
- Empty state theo ngữ cảnh:
  - chưa có dữ liệu
  - folder trống
  - không có kết quả search/filter

### Error
- Có message rõ ràng
- Có retry hoặc next-step rõ ràng
- Không để lỗi chìm trong layout

### Success
- Dùng toast kết hợp inline confirmation khi cần

### Disabled / Permission
- Giải thích lý do action bị khóa hoặc không khả dụng

---

## Component Strategy

### Reuse First
Ưu tiên refactor và chuẩn hóa trên các component hiện có thay vì tạo mới tràn lan.

### Likely new / refactored component groups
- `AppShell` / `Sidebar` / `Topbar`
- `PageHeader`
- `ContextBar`
- `QuickActions`
- `RecentActivity`
- `AccountSections`
- Shared empty/loading/error state wrappers

### Constraints
- Không đơn giản hóa quá mức các component hiện có theo hướng làm mất capability
- Giữ clean code, single responsibility, error handling rõ ràng

---

## Data Flow Considerations

### Principles
- Không đổi backend contract trong phase design này
- Tận dụng dữ liệu hiện có để tái sắp xếp UX trước
- Role-based adaptation dựa trên auth state hiện tại trong `providers.tsx`

### Dashboard data
- Có thể cần tổng hợp lại dữ liệu hiện có thành các module “recent”, “quick actions”, “summary” ở tầng UI composition

### Page-level behavior
- Search/filter/sort state cần hiển thị rõ với user
- Route context và breadcrumb phải đồng bộ với shell mới

---

## Testing and Verification Strategy

### UX Verification
- Kiểm tra người dùng có thể xác định nhanh navigation chính
- Kiểm tra dashboard có hỗ trợ continuation of work tốt hơn hiện tại
- Kiểm tra documents/news/account/admin có cùng UX grammar

### Functional Regression
- Auth redirect vẫn đúng
- Role-based nav vẫn đúng
- Breadcrumb vẫn phản ánh route hiện tại
- Documents/news/admin flows giữ nguyên capability

### Responsive Verification
- Desktop shell
- Tablet overlay navigation
- Mobile drawer / stacked layout behavior

### Build Verification for implementation phase
- `pnpm --filter web lint`
- `pnpm --filter web build`

---

## Risks and Mitigations

### Risk 1: Over-design làm giảm tốc độ thao tác
**Mitigation:** ưu tiên utility-first layout, không biến authenticated area thành marketing UI.

### Risk 2: Sidebar migration làm đứt mental model hiện tại
**Mitigation:** giữ naming và route grouping quen thuộc, chỉ đổi cách tổ chức và hierarchy.

### Risk 3: User/admin experience bị phân mảnh
**Mitigation:** một shell chung, component language chung, chỉ thay đổi nav scope và content modules.

### Risk 4: Documents/news không đồng nhất sau redesign
**Mitigation:** dùng chung page structure pattern: page header + context bar + content canvas + state system.

---

## Success Criteria

- Authenticated area có một shell thống nhất, rõ ràng
- Navigation chính không còn phụ thuộc vào header crowded
- Dashboard trở thành trang có giá trị thao tác thực sự
- Documents, News, Account, Admin chia sẻ cùng một UX language
- Trải nghiệm responsive hợp lý trên desktop/tablet/mobile
- Thiết kế đủ cụ thể để chuyển sang implementation planning

---

## Implementation Notes for Planning Phase

- Ưu tiên rollout theo shell trước, page modules sau
- Giữ scope refactor tập trung vào UX structure, không mở rộng sang backend changes
- Đảm bảo mọi thay đổi follow existing Next.js app router boundaries trong `apps/web/app/(dashboard)`
