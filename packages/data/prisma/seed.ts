import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seed dữ liệu...');

  // Tạo admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      fullName: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Đã tạo admin:', admin.email);

  // Tạo user thường
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      fullName: 'Test User',
      passwordHash: userPassword,
      role: 'USER',
    },
  });
  console.log('Đã tạo user:', user.email);

  // Tạo sample documents
  const docData = [
    {
      userId: admin.id,
      title: 'Giáo trình Toán học lớp 10',
      description: 'Giáo trình Toán học dành cho học sinh lớp 10, bao gồm Đại số và Hình học.',
      author: 'Bộ Giáo dục',
      subject: 'Toán học',
      keywords: JSON.stringify(['toán', 'lớp 10', 'giáo trình', 'đại số', 'hình học']),
      fileName: 'toan-lop-10.pdf',
      filePath: '/uploads/sample/toan-lop-10.pdf',
      fileSize: 5242880,
      mimeType: 'application/pdf',
      isPublic: true,
      status: 'ACTIVE',
    },
    {
      userId: admin.id,
      title: 'Vật lý đại cương',
      description: 'Tài liệu Vật lý đại cương cho sinh viên năm nhất.',
      author: 'Nguyễn Văn A',
      subject: 'Vật lý',
      keywords: JSON.stringify(['vật lý', 'đại cương', 'sinh viên']),
      fileName: 'vat-ly-dai-cuong.pdf',
      filePath: '/uploads/sample/vat-ly-dai-cuong.pdf',
      fileSize: 3145728,
      mimeType: 'application/pdf',
      isPublic: true,
      status: 'ACTIVE',
    },
    {
      userId: user.id,
      title: 'Bài tập Lập trình Python',
      description: 'Tổng hợp bài tập lập trình Python từ cơ bản đến nâng cao.',
      author: 'Trần Văn B',
      subject: 'Lập trình',
      keywords: JSON.stringify(['python', 'lập trình', 'bài tập']),
      fileName: 'python-exercises.docx',
      filePath: '/uploads/sample/python-exercises.docx',
      fileSize: 1048576,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      isPublic: false,
      status: 'ACTIVE',
    },
  ];

  for (const doc of docData) {
    await prisma.document.create({ data: doc });
  }
  console.log('Đã tạo', docData.length, 'tài liệu mẫu');

  // Tạo danh mục tin tức
  const categories = [
    { name: 'Giáo dục', slug: 'giao-duc', description: 'Tin tức về giáo dục', order: 1 },
    { name: 'Đào tạo', slug: 'dao-tao', description: 'Tin tức về đào tạo', order: 2 },
    { name: 'Sự kiện', slug: 'su-kien', description: 'Sự kiện và hoạt động', order: 3 },
    { name: 'Nghiên cứu', slug: 'nghien-cuu', description: 'Nghiên cứu khoa học', order: 4 },
    { name: 'Công nghệ', slug: 'cong-nghe', description: 'Tin công nghệ giáo dục', order: 5 },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const created = await prisma.newsCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(created);
  }
  console.log('Đã tạo', createdCategories.length, 'danh mục tin tức');

  // Tạo sample news
  const newsData = [
    {
      userId: admin.id,
      categoryId: createdCategories[0].id,
      title: 'Bộ Giáo dục công bố chương trình học mới năm 2026',
      slug: 'bo-giao-duc-cong-bo-chuong-trinh-hoc-moi-nam-2026',
      summary: 'Bộ Giáo dục và Đào tạo vừa công bố chương trình giáo dục phổ thông mới với nhiều thay đổi tích cực.',
      content: `<p>Bộ Giáo dục và Đào tạo vừa công bố chương trình giáo dục phổ thông mới với nhiều thay đổi tích cực, tập trung vào phát triển năng lực người học.</p>
<p><strong>Nội dung chính:</strong></p>
<ul>
<li>Tăng thời lượng cho các môn Khoa học và Công nghệ</li>
<li>Giảm tải kiến thức lý thuyết</li>
<li>Tăng cường thực hành và trải nghiệm</li>
</ul>
<p>Chương trình mới sẽ được áp dụng từ năm học 2026-2027.</p>`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date(),
      status: 'PUBLISHED',
    },
    {
      userId: admin.id,
      categoryId: createdCategories[1].id,
      title: 'Khai giảng khóa học trực tuyến miễn phí về AI',
      slug: 'khai-giang-khoa-hoc-truc-tuyen-mien-phi-ve-ai',
      summary: 'Khóa học Artificial Intelligence cơ bản dành cho giáo viên và sinh viên sư phạm.',
      content: `<p>Nhằm trang bị kiến thức về AI cho đội ngũ giáo viên, Bộ Giáo dục phối hợp với các đối tác công nghệ tổ chức khóa học miễn phí.</p>
<p><strong>Thông tin khóa học:</strong></p>
<ul>
<li>Thời lượng: 40 giờ</li>
<li>Hình thức: Trực tuyến</li>
<li>Chứng chỉ: Được cấp sau khi hoàn thành</li>
</ul>
<p>Đăng ký tại website chính thức của Bộ.</p>`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date(),
      status: 'PUBLISHED',
    },
    {
      userId: admin.id,
      categoryId: createdCategories[2].id,
      title: 'Hội thảo quốc tế về đổi mới phương pháp dạy học',
      slug: 'hoi-thao-quoc-te-ve-doi-moi-phuong-phap-day-hoc',
      summary: 'Hội thảo quy tụ hơn 500 chuyên gia giáo dục từ 20 quốc gia.',
      content: `<p>Hội thảo quốc tế về đổi mới phương pháp dạy học lần thứ 5 đã diễn ra thành công tại Hà Nội.</p>
<p>Các chủ đề chính được thảo luận:</p>
<ul>
<li>Dạy học theo dự án</li>
<li>Ứng dụng công nghệ trong giáo dục</li>
<li>Phát triển tư duy sáng tạo</li>
</ul>`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date(Date.now() - 86400000), // 1 day ago
      status: 'PUBLISHED',
    },
    {
      userId: admin.id,
      categoryId: createdCategories[3].id,
      title: 'Nghiên cứu mới về tác động của học trực tuyến',
      slug: 'nghien-cuu-moi-ve-tac-dong-cua-hoc-truc-tuyen',
      summary: 'Kết quả nghiên cứu chỉ ra những điểm mạnh và hạn chế của hình thức học trực tuyến.',
      content: `<p>Một nghiên cứu mới được công bố bởi Viện Khoa học Giáo dục đã phân tích tác động của học trực tuyến đối với học sinh.</p>
<p><strong>Kết quả chính:</strong></p>
<ul>
<li>Tăng khả năng tự học</li>
<li>Giảm tương tác xã hội trực tiếp</li>
<li>Cần hỗ trợ kỹ thuật tốt hơn</li>
</ul>`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&q=80',
      isPublished: true,
      isFeatured: false,
      publishedAt: new Date(Date.now() - 172800000), // 2 days ago
      status: 'PUBLISHED',
    },
    {
      userId: admin.id,
      categoryId: createdCategories[4].id,
      title: 'Ứng dụng VR/AR trong giảng dạy đang trở thành xu hướng',
      slug: 'ung-dung-vr-ar-trong-giang-day-dang-tro-thanh-xu-huong',
      summary: 'Công nghệ thực tế ảo và thực tế tăng cường đang thay đổi cách chúng ta dạy và học.',
      content: `<p>Công nghệ VR/AR đang được ứng dụng rộng rãi trong giáo dục, từ các phòng thí nghiệm ảo đến tham quan di tích lịch sử.</p>
<p><strong>Lợi ích:</strong></p>
<ul>
<li>Trải nghiệm học tập sống động</li>
<li>Tiết kiệm chi phí thiết bị</li>
<li>An toàn hơn trong các thí nghiệm</li>
</ul>`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&q=80',
      isPublished: true,
      isFeatured: true,
      publishedAt: new Date(),
      status: 'PUBLISHED',
    },
  ];

  for (const news of newsData) {
    await prisma.news.create({ data: news });
  }
  console.log('Đã tạo', newsData.length, 'bài viết mẫu');

  console.log('Seed hoàn tất!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
