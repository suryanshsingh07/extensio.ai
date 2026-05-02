const Organization = require('../models/Organization');

class OrganizationService {
  static async createOrganization(ownerId, name, billingEmail) {
    const org = new Organization({
      name,
      billingEmail,
      ownerId,
      members: [{ userId: ownerId, role: 'ADMIN' }]
    });

    await org.save();
    return org;
  }
  static async addMember(orgId, adminId, targetUserId, role = 'VIEWER') {
    const org = await Organization.findById(orgId);
    if (!org) throw new Error('Organization not found.');

    // Enforce RBAC
    const isAdmin = org.members.some(m => m.userId.toString() === adminId.toString() && m.role === 'ADMIN');
    if (!isAdmin && org.ownerId.toString() !== adminId.toString()) {
      throw new Error('Unauthorized: Only Admins can add members.');
    }

    // Check seat limits
    if (org.members.length >= org.settings.maxSeats) {
      throw new Error('Seat limit reached. Upgrade Enterprise plan to add more members.');
    }

    // Add member
    org.members.push({ userId: targetUserId, role });
    await org.save();

    return org;
  }

  static async shareProjectWithOrg(orgId, userId, projectId) {
    const org = await Organization.findById(orgId);
    if (!org) throw new Error('Organization not found.');

    const isMember = org.members.some(m => m.userId.toString() === userId.toString() && ['ADMIN', 'EDITOR'].includes(m.role));
    if (!isMember) {
      throw new Error('Unauthorized: Must be an Admin or Editor to share projects to the workspace.');
    }

    if (!org.sharedProjects.includes(projectId)) {
      org.sharedProjects.push(projectId);
      await org.save();
    }

    return true;
  }
}

module.exports = OrganizationService;
