import { Page, expect } from '@playwright/test';

export class ProjectPage {
  // Locators for project page elements
  private readonly projectManagementLink = this.page.getByRole('menuitem', {
    name: 'library_add_check Project',
  });
  private readonly addProjectButton = this.page.getByText('Add project');
  private readonly projectNameInput = this.page.getByPlaceholder(
    'Add project names separated by new lines',
  );
  private readonly saveButton = this.page.getByRole('button', { name: 'Save' });
  private readonly projectCreatedNotification =
    this.page.locator('.jGrowl-message');
  private readonly projectsTable = this.page.locator('table tbody');
  private readonly projectTableRow = this.projectsTable.locator('tr');
  private readonly projectTableCell = this.projectTableRow.locator('td');

  constructor(private readonly page: Page) {}

  async navigateToProjectsPage(): Promise<void> {
    await this.projectManagementLink.click();
    await expect(this.page).toHaveURL(/.*\/projects.*/);
  }

  async clickAddProjectButton(): Promise<void> {
    await this.addProjectButton.click();
    await expect(this.projectNameInput).toBeVisible();
  }

  async fillProjectName(projectName: string): Promise<void> {
    await this.projectNameInput.fill(projectName);
  }

  async clickSaveButton(): Promise<void> {
    await this.saveButton.click();
  }

  async verifyProjectCreatedNotification(): Promise<void> {
    await expect(this.projectCreatedNotification).toBeVisible();
  }

  async verifyProjectInList(projectName: string): Promise<void> {
    const projectInList = this.projectTableCell.filter({
      hasText: projectName,
    });
    await expect(projectInList).toBeVisible();
  }

  async createProject(projectName: string): Promise<void> {
    await this.clickAddProjectButton();

    await this.fillProjectName(projectName);
    await this.clickSaveButton();

    await this.verifyProjectCreatedNotification();
    await this.verifyProjectInList(projectName);
  }
}

