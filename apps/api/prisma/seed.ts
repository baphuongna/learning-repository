import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
